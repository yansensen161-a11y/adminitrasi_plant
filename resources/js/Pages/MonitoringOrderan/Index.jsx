import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Head, router, useForm, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';

export default function Index({ orders, units, filters, nextNoOrder }) {
    const { auth } = usePage().props;
    const isAdmin = auth?.user?.roles?.some(r => ['super-admin', 'admin'].includes(r.name));
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [activeTab, setActiveTab] = useState(() => {
        try {
            if (typeof window !== 'undefined') {
                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams.has('tab')) return urlParams.get('tab');
                const saved = sessionStorage.getItem('plant_monitoring_orderan_tab');
                if (saved) return saved;
            }
        } catch (e) {}
        return 'ORDERAN AKTIF';
    });

    useEffect(() => {
        try {
            sessionStorage.setItem('plant_monitoring_orderan_tab', activeTab);
        } catch (e) {}
    }, [activeTab]);

    const [dateFrom, setDateFrom] = useState(filters.dateFrom || '');
    const [dateTo, setDateTo] = useState(filters.dateTo || '');
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [sortBy, setSortBy] = useState(filters.sortBy || 'terbaru');
    const [showPrintMolModal, setShowPrintMolModal] = useState(false);
    const [selectedPrintMolId, setSelectedPrintMolId] = useState('');

    // Helper to get initial col filter from URL params or sessionStorage
    const getInitialColFilter = () => {
        const defaultFilter = {
            no_order: '', code_unit: '', type_unit: '', component: '',
            order_by: '', priority: '', swap_to_unit: '', date: '',
            pr: '', po: '', eta_part: '', progress: ''
        };

        if (typeof window === 'undefined') return defaultFilter;

        try {
            const urlParams = new URLSearchParams(window.location.search);
            const hasAnyUrlCol = Object.keys(defaultFilter).some(key => urlParams.has(key));
            if (hasAnyUrlCol) {
                const res = { ...defaultFilter };
                Object.keys(defaultFilter).forEach(key => {
                    if (urlParams.has(key)) res[key] = urlParams.get(key);
                });
                return res;
            }

            const saved = sessionStorage.getItem('plant_monitoring_orderan_col_filter');
            if (saved) {
                const parsed = JSON.parse(saved);
                return { ...defaultFilter, ...parsed };
            }
        } catch (e) {
            console.error("Error reading saved filters:", e);
        }

        return defaultFilter;
    };

    // Per-column filters (client-side with sessionStorage persistence)
    const [colFilter, setColFilter] = useState(getInitialColFilter);
    const setCol = (key, val) => setColFilter(prev => ({ ...prev, [key]: val }));
    
    const resetColFilters = () => {
        const empty = { no_order:'', code_unit:'', type_unit:'', component:'', order_by:'', priority:'', swap_to_unit:'', date:'', pr:'', po:'', eta_part:'', progress:'' };
        setColFilter(empty);
        try {
            sessionStorage.removeItem('plant_monitoring_orderan_col_filter');
            if (typeof window !== 'undefined') {
                const url = new URL(window.location.href);
                Object.keys(empty).forEach(k => url.searchParams.delete(k));
                window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
            }
        } catch (e) {}
    };

    // Auto-save column filters to sessionStorage & sync to URL
    useEffect(() => {
        try {
            sessionStorage.setItem('plant_monitoring_orderan_col_filter', JSON.stringify(colFilter));
            if (typeof window !== 'undefined') {
                const url = new URL(window.location.href);
                Object.entries(colFilter).forEach(([k, v]) => {
                    if (v) {
                        url.searchParams.set(k, v);
                    } else {
                        url.searchParams.delete(k);
                    }
                });
                window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
            }
        } catch (e) {}
    }, [colFilter]);

    // Distinct filter options per column (like progress order dropdown)
    const filterOptions = useMemo(() => {
        const noOrders = new Set();
        const codeUnits = new Set();
        const typeUnits = new Set();
        const components = new Set();
        const orderBys = new Set();
        const swapUnits = new Set();
        const dates = new Set();
        const prs = new Set();
        const pos = new Set();
        const etaParts = new Set();

        (orders || []).forEach(order => {
            if (order.no_order) noOrders.add(order.no_order);

            const cUnit = order.unit?.code_unit || (['ATK', 'CONSUMABLE', 'TOOL'].find(v => order.lokasi?.toUpperCase().startsWith(v)));
            if (cUnit) codeUnits.add(cUnit);

            if (order.unit?.type_unit) typeUnits.add(order.unit.type_unit);

            const firstPart = order.parts && order.parts.length > 0 ? order.parts[0] : {};
            const comp = order.component_name || order.component || firstPart.component || firstPart.department;
            if (comp && comp !== '-') components.add(comp);

            if (order.pic && order.pic !== '-') orderBys.add(order.pic);

            if (order.tanggal) dates.add(order.tanggal);

            (order.parts || []).forEach(part => {
                if (part.swap_to_unit?.code_unit) swapUnits.add(part.swap_to_unit.code_unit);
                if (part.pr && part.pr.trim() !== '' && part.pr !== '-') prs.add(part.pr.trim());
                if (part.po && part.po.trim() !== '' && part.po !== '-') pos.add(part.po.trim());
                if (part.due_date_part && part.due_date_part.trim() !== '' && part.due_date_part !== '-' && part.due_date_part !== '1970-01-01') {
                    etaParts.add(part.due_date_part.trim());
                }
            });
        });

        return {
            no_order: Array.from(noOrders).sort((a, b) => b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' })),
            code_unit: Array.from(codeUnits).sort(),
            type_unit: Array.from(typeUnits).sort(),
            component: Array.from(components).sort(),
            order_by: Array.from(orderBys).sort(),
            swap_to_unit: Array.from(swapUnits).sort(),
            date: Array.from(dates).sort((a, b) => b.localeCompare(a)),
            pr: Array.from(prs).sort(),
            po: Array.from(pos).sort(),
            eta_part: Array.from(etaParts).sort((a, b) => b.localeCompare(a)),
        };
    }, [orders]);

    const handleFilter = (e) => {
        if(e) e.preventDefault();
        router.get(route('monitoring-orderan.index'), {
            dateFrom, dateTo, search, status: statusFilter, sortBy
        }, { preserveState: true });
    };

    const handleReset = () => {
        setDateFrom(''); setDateTo(''); setSearch(''); setStatusFilter(''); setSortBy('terbaru');
        resetColFilters();
        router.get(route('monitoring-orderan.index'), {}, { preserveState: true });
    };

    const normalizePriority = (prio) => {
        const p = (prio || '').toUpperCase().trim();
        if (p === 'HIGH' || p === 'P1') return 'P1';
        if (p === 'MEDIUM' || p === 'P2') return 'P2';
        if (p === 'LOW' || p === 'P3') return 'P3';
        if (p === 'BACKLOG') return 'BACKLOG';
        return p || '-';
    };

    // Filtered orders (memoized) - selalu tampilkan nomor order tertinggi di posisi paling atas
    const filteredOrders = useMemo(() => {
        return (orders || []).filter(order => {
            const parts = order.parts || [];
            const fp = parts.length > 0 ? parts[0] : {};
            const cf = colFilter;

            const orderUnitCode = order.unit?.code_unit || (['ATK', 'CONSUMABLE', 'TOOL'].find(v => order.lokasi?.toUpperCase().startsWith(v))) || '';
            const orderComp = order.component_name || order.component || fp.component || fp.department || '';

            const matchNoOrder = !cf.no_order || order.no_order === cf.no_order;
            const matchCodeUnit = !cf.code_unit || orderUnitCode === cf.code_unit;
            const matchTypeUnit = !cf.type_unit || order.unit?.type_unit === cf.type_unit;
            const matchComponent = !cf.component || 
                orderComp === cf.component || 
                order.component_name === cf.component || 
                order.component === cf.component || 
                parts.some(p => (p.component || p.department) === cf.component);
            const matchOrderBy = !cf.order_by || order.pic === cf.order_by;
            const matchPriority = !cf.priority || cf.priority === '' || normalizePriority(order.priority) === normalizePriority(cf.priority);
            const matchSwap = !cf.swap_to_unit || parts.some(p => p.swap_to_unit?.code_unit === cf.swap_to_unit);
            const matchDate = !cf.date || order.tanggal === cf.date;

            const hasPr = parts.some(p => p.pr && p.pr.trim() !== '' && p.pr !== '-');
            const matchPr = !cf.pr
                ? true
                : cf.pr === '__EMPTY__'
                    ? !hasPr
                    : cf.pr === '__EXISTS__'
                        ? hasPr
                        : parts.some(p => p.pr === cf.pr);

            const hasPo = parts.some(p => p.po && p.po.trim() !== '' && p.po !== '-');
            const matchPo = !cf.po
                ? true
                : cf.po === '__EMPTY__'
                    ? !hasPo
                    : parts.some(p => p.po === cf.po);

            const hasValidEta = parts.some(p => p.due_date_part && p.due_date_part.trim() !== '' && p.due_date_part !== '-' && p.due_date_part !== '1970-01-01');
            const matchEta = !cf.eta_part
                ? true
                : cf.eta_part === '__EMPTY__'
                    ? !hasValidEta
                    : parts.some(p => p.due_date_part === cf.eta_part);

            const matchProgress = !cf.progress || order.status === cf.progress;

            return (
                matchNoOrder &&
                matchCodeUnit &&
                matchTypeUnit &&
                matchComponent &&
                matchOrderBy &&
                matchPriority &&
                matchSwap &&
                matchDate &&
                matchPr &&
                matchPo &&
                matchEta &&
                matchProgress &&
                (
                    activeTab === 'ORDERAN AKTIF' ? ['WAITING PART', 'IN PROGRESS', 'PARTIAL', 'OPEN', 'PROCESS'].includes(order.status) :
                    activeTab === 'CANCEL ORDER' ? order.status === 'CANCEL ORDER' :
                    activeTab === 'BACKLOG' ? order.status === 'BACKLOG' :
                    activeTab === 'HISTORICAL ORDER' ? ['COMPLETED', 'CLOSED', 'CANCEL ORDER'].includes(order.status) : true
                )
            );
        }).sort((a, b) => {
            const noA = a.no_order || '';
            const noB = b.no_order || '';
            return noB.localeCompare(noA, undefined, { numeric: true, sensitivity: 'base' });
        });
    }, [orders, colFilter, activeTab]);

    // WA Sharing Feature
    const [showWaModal, setShowWaModal] = useState(false);
    const [waScope, setWaScope] = useState('filtered'); // 'filtered' | 'all_active'
    const [waCategory, setWaCategory] = useState('ALL'); // 'ALL' | 'P1' | 'P2' | 'P3' | 'BACKLOG'
    const [waFormat, setWaFormat] = useState('per_equipment'); // 'per_equipment' | 'simple' | 'per_part' | 'detail'
    const [waWithNumber, setWaWithNumber] = useState(true);
    const [waWithHeader, setWaWithHeader] = useState(true);
    const [waWithAchievement, setWaWithAchievement] = useState(true);
    const [waWithCategory, setWaWithCategory] = useState(false); // tampilkan kategori di tiap baris
    const [waWithProblem, setWaWithProblem] = useState(false); // default false: description part tidak dimasukkan
    const [waCustomText, setWaCustomText] = useState('');
    const [toastMessage, setToastMessage] = useState('');
    const [copySuccess, setCopySuccess] = useState(false);

    const isBelumDatang = (order) => !['CLOSED', 'COMPLETED', 'CANCEL ORDER'].includes((order.status || '').toUpperCase());

    const filteredBelumDatang = useMemo(() => {
        return filteredOrders.filter(isBelumDatang);
    }, [filteredOrders]);

    const allBelumDatang = useMemo(() => {
        return (orders || []).filter(isBelumDatang);
    }, [orders]);

    const scopeOrders = useMemo(() => {
        return waScope === 'all_active' ? allBelumDatang : filteredBelumDatang;
    }, [waScope, allBelumDatang, filteredBelumDatang]);

    const categoryCounts = useMemo(() => {
        const counts = { ALL: scopeOrders.length, P1: 0, P2: 0, P3: 0, BACKLOG: 0 };
        scopeOrders.forEach(order => {
            const norm = normalizePriority(order.priority);
            if (counts[norm] !== undefined) {
                counts[norm]++;
            }
        });
        return counts;
    }, [scopeOrders]);

    const activeWaList = useMemo(() => {
        if (waCategory === 'ALL') return scopeOrders;
        return scopeOrders.filter(order => normalizePriority(order.priority) === waCategory);
    }, [scopeOrders, waCategory]);

    const getUnitName = (order) => {
        return order.unit?.code_unit 
            || (['ATK', 'CONSUMABLE', 'TOOL'].find(v => order.lokasi?.toUpperCase().startsWith(v))) 
            || order.lokasi 
            || 'NON-UNIT';
    };

    const getEquipmentName = (order) => {
        const typeUnit = order.unit?.type_unit;
        if (typeUnit && typeUnit.trim() !== '' && typeUnit.trim() !== '-') {
            return typeUnit.trim().toUpperCase();
        }

        // Non-unit locations (ATK, CONSUMABLE, TOOL)
        const nonUnits = ['ATK', 'CONSUMABLE', 'TOOL'];
        const foundNonUnit = nonUnits.find(v => order.lokasi?.toUpperCase().startsWith(v));
        if (foundNonUnit) {
            return foundNonUnit;
        }

        // Detect Light Vehicle (Triton / Pajero / codes like B-16, G-03, H-02, T-02)
        const model = (order.unit?.model || '').toUpperCase();
        const code = (order.unit?.code_unit || '').toUpperCase();
        if (model.includes('TRITON') || model.includes('PAJERO') || model.includes('PASSANGER') || /^[A-Z]-\d+/.test(code)) {
            return 'LIGHT VEHICLE';
        }

        return (order.lokasi && order.lokasi.trim() !== '-' ? order.lokasi.trim().toUpperCase() : 'GENERAL / LAINNYA');
    };

    const calculatePrStats = (targetOrders) => {
        let totalPr = 0;
        let donePo = 0;
        const eqSet = new Set();

        (targetOrders || []).forEach(order => {
            eqSet.add(getEquipmentName(order));
            const parts = order.parts || [];
            const hasPr = parts.some(p => p.pr && p.pr !== '-' && p.pr.trim() !== '');
            if (hasPr) {
                totalPr++;
                const hasPo = parts.some(p => p.po && p.po !== '-' && p.po.trim() !== '');
                if (hasPo) {
                    donePo++;
                }
            }
        });

        const pendingPo = totalPr - donePo;
        const achievement = totalPr > 0 ? ((donePo / totalPr) * 100).toFixed(1) : '0';
        const ordersWithoutPr = (targetOrders || []).length - totalPr;

        return {
            totalOrders: (targetOrders || []).length,
            totalEquipments: eqSet.size,
            totalPr,
            ordersWithoutPr,
            donePo,
            pendingPo,
            achievement
        };
    };

    const modalStats = useMemo(() => {
        return calculatePrStats(activeWaList);
    }, [activeWaList]);

    const getOrderDesc = (order) => {
        // Hanya ambil root_cause (Problem/Kerusakan) atau component jika dibutuhkan
        // Sama sekali TIDAK memasukkan nama/deskripsi part
        const rootCause = order.root_cause && order.root_cause.trim() !== '-' ? order.root_cause.trim() : '';
        if (rootCause) return rootCause;

        if (order.component_name && order.component_name.trim() !== '-') {
            return order.component_name.trim();
        }

        if (order.component && order.component.trim() !== '-') {
            return order.component.trim();
        }

        return '';
    };

    const generateWaText = (targetOrders, format = 'per_equipment', withNumber = true, withHeader = false, withProblem = false, withAchievement = true, withCategory = false, categoryName = 'ALL') => {
        if (!targetOrders || targetOrders.length === 0) {
            return `Tidak ada data orderan yang belum datang.`;
        }

        const now = new Date();
        const dateStr = now.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
        const stats = calculatePrStats(targetOrders);

        let lines = [];

        if (format === 'per_equipment') {
            // Format rapi dikelompokkan per Equipment (type_unit / Jenis Equipment)
            const groups = new Map();
            targetOrders.forEach(order => {
                const eq = getEquipmentName(order);
                if (!groups.has(eq)) {
                    groups.set(eq, []);
                }
                groups.get(eq).push(order);
            });

            // Sort Equipment (non-unit di bagian bawah)
            const sortedEquipments = Array.from(groups.keys()).sort((a, b) => {
                const aIsNon = ['ATK', 'CONSUMABLE', 'TOOL', 'GENERAL'].some(v => a.startsWith(v));
                const bIsNon = ['ATK', 'CONSUMABLE', 'TOOL', 'GENERAL'].some(v => b.startsWith(v));
                if (aIsNon && !bIsNon) return 1;
                if (!aIsNon && bIsNon) return -1;
                return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
            });

            sortedEquipments.forEach((equipmentName) => {
                const eqOrders = groups.get(equipmentName);
                const isNonUnit = ['ATK', 'CONSUMABLE', 'TOOL', 'GENERAL'].some(v => equipmentName.startsWith(v));
                const icon = isNonUnit ? '📦' : '🚜';
                const countStr = eqOrders.length > 1 ? ` (${eqOrders.length} Order)` : ' (1 Order)';
                let block = `*${icon} ${equipmentName}*${countStr}\n`;

                // Sort order di dalam equipment berdasarkan kode unit
                const sortedEqOrders = [...eqOrders].sort((a, b) => {
                    const uA = getUnitName(a);
                    const uB = getUnitName(b);
                    const cmp = uA.localeCompare(uB, undefined, { numeric: true, sensitivity: 'base' });
                    if (cmp !== 0) return cmp;
                    return (a.no_order || '').localeCompare(b.no_order || '');
                });

                sortedEqOrders.forEach((order, idx) => {
                    const unitCode = getUnitName(order);
                    const parts = order.parts || [];
                    const validPrs = Array.from(new Set(parts.map(p => p.pr).filter(p => p && p.trim() !== '-')));
                    const prs = validPrs.length > 0 ? validPrs.join(', ') : 'Belum Ada PR';

                    const validPos = Array.from(new Set(parts.map(p => p.po).filter(p => p && p.trim() !== '-')));
                    const validEtas = Array.from(new Set(parts.map(p => p.due_date_part).filter(p => p && p.trim() !== '-')));

                    let poEtaStr = '';
                    if (validPos.length === 0) {
                        poEtaStr = 'Belum Ada PO';
                    } else {
                        const poStr = validPos.join(', ');
                        const etaStr = validEtas.length > 0 ? `& ETA ${validEtas.join(', ')}` : '& ETA -';
                        poEtaStr = `${poStr} ${etaStr}`;
                    }

                    const segments = [unitCode];
                    if (withCategory) {
                        segments.push(normalizePriority(order.priority));
                    }
                    segments.push(prs);
                    if (withProblem) {
                        const desc = getOrderDesc(order);
                        if (desc) segments.push(desc);
                    }
                    segments.push(poEtaStr);

                    const lineText = segments.join(' - ');
                    const bullet = withNumber ? `${idx + 1}. ` : `• `;
                    block += `  ${bullet}${lineText}\n`;
                });

                lines.push(block.trimEnd());
            });
        } else if (format === 'simple') {
            // Sort per equipment secara alami agar order pada unit yang sama berurutan
            const sortedOrders = [...targetOrders].sort((a, b) => {
                const cmp = getUnitName(a).localeCompare(getUnitName(b), undefined, { numeric: true, sensitivity: 'base' });
                if (cmp !== 0) return cmp;
                return (a.no_order || '').localeCompare(b.no_order || '');
            });

            // Format bersih rapi: [UNIT] - [KATEGORI?] - [NO PR] - [PO] & ETA [TGL]
            sortedOrders.forEach((order, idx) => {
                const unit = getUnitName(order);
                const parts = order.parts || [];
                const validPrs = Array.from(new Set(parts.map(p => p.pr).filter(p => p && p.trim() !== '-')));
                const prs = validPrs.length > 0 ? validPrs.join(', ') : 'Belum Ada PR';
                
                const validPos = Array.from(new Set(parts.map(p => p.po).filter(p => p && p.trim() !== '-')));
                const hasPo = validPos.length > 0;
                
                const validEtas = Array.from(new Set(parts.map(p => p.due_date_part).filter(p => p && p.trim() !== '-')));
                const hasEta = validEtas.length > 0;

                let poEtaStr = '';
                if (!hasPo) {
                    poEtaStr = 'Belum Ada PO';
                } else {
                    const poStr = validPos.join(', ');
                    const etaStr = hasEta ? `& ETA ${validEtas.join(', ')}` : '& ETA -';
                    poEtaStr = `${poStr} ${etaStr}`;
                }

                const segments = [unit];
                if (withCategory) {
                    segments.push(normalizePriority(order.priority));
                }
                segments.push(prs);
                if (withProblem) {
                    const desc = getOrderDesc(order);
                    if (desc) segments.push(desc);
                }
                segments.push(poEtaStr);

                const line = segments.join(' - ');
                lines.push(withNumber ? `${idx + 1}. ${line}` : line);
            });
        } else if (format === 'per_part') {
            // Rincian per item PO/PR tanpa deskripsi part
            targetOrders.forEach((order) => {
                const unit = order.unit?.code_unit || (['ATK', 'CONSUMABLE', 'TOOL'].find(v => order.lokasi?.toUpperCase().startsWith(v))) || order.lokasi || '-';
                const parts = order.parts || [];
                if (parts.length === 0) {
                    const segments = [unit];
                    if (withCategory) segments.push(normalizePriority(order.priority));
                    segments.push('Belum Ada PR', 'Belum Ada PO');
                    const line = segments.join(' - ');
                    lines.push(withNumber ? `${lines.length + 1}. ${line}` : line);
                } else {
                    parts.forEach((p) => {
                        const prText = p.pr && p.pr.trim() !== '-' ? p.pr.trim() : 'Belum Ada PR';
                        const hasPo = p.po && p.po.trim() !== '-';
                        const hasEta = p.due_date_part && p.due_date_part.trim() !== '-';
                        let poEta = 'Belum Ada PO';
                        if (hasPo) {
                            poEta = hasEta ? `${p.po.trim()} & ETA ${p.due_date_part.trim()}` : `${p.po.trim()} & ETA -`;
                        }
                        const segments = [unit];
                        if (withCategory) segments.push(normalizePriority(order.priority));
                        segments.push(prText);
                        if (withProblem) {
                            const desc = getOrderDesc(order);
                            if (desc) segments.push(desc);
                        }
                        segments.push(poEta);
                        const line = segments.join(' - ');
                        lines.push(withNumber ? `${lines.length + 1}. ${line}` : line);
                    });
                }
            });
        } else {
            // Detail multi-line (ringkas)
            targetOrders.forEach((order, idx) => {
                const unit = order.unit?.code_unit || (['ATK', 'CONSUMABLE', 'TOOL'].find(v => order.lokasi?.toUpperCase().startsWith(v))) || order.lokasi || '-';
                const parts = order.parts || [];
                let block = `*${idx + 1}. ${unit} - ${order.no_order || '-'}`;
                if (withCategory) {
                    block += ` [${normalizePriority(order.priority)}]`;
                }
                block += `*\n`;
                block += `• Status: ${order.status || '-'} | PIC: ${order.pic || '-'}\n`;
                if (withProblem) {
                    const desc = getOrderDesc(order);
                    if (desc) block += `• Problem: ${desc}\n`;
                }
                if (parts.length > 0) {
                    parts.forEach((p) => {
                        const prText = p.pr && p.pr !== '-' ? p.pr : 'Belum Ada PR';
                        const poText = p.po && p.po !== '-' ? p.po : 'Belum Ada PO';
                        const etaText = p.due_date_part && p.due_date_part !== '-' ? p.due_date_part : '-';
                        block += `  - PR: ${prText} | PO: ${poText} & ETA: ${etaText}\n`;
                    });
                }
                lines.push(block);
            });
        }

        let result = '';
        if (withHeader) {
            const catSuffix = categoryName !== 'ALL' ? ` (${categoryName})` : '';
            result += `*📢 MONITORING ORDERAN - PART BELUM DATANG${catSuffix}*\n`;
            result += `📅 _Update: ${dateStr} - ${timeStr} WIB_\n`;
            const eqText = stats.totalEquipments > 0 ? ` | ${stats.totalEquipments} Equipment` : '';
            if (stats.ordersWithoutPr > 0) {
                result += `📊 _Total: ${stats.totalOrders} Orderan (${stats.totalPr} PR, ${stats.ordersWithoutPr} Belum Ada PR)${eqText}_\n`;
            } else {
                result += `📊 _Total: ${stats.totalOrders} Orderan (${stats.totalPr} PR)${eqText}_\n`;
            }
            if (withAchievement && stats.totalPr > 0) {
                result += `🎯 _Achievement PR → PO: ${stats.achievement}% (${stats.donePo}/${stats.totalPr} PR sudah proses PO)_\n`;
                if (stats.pendingPo > 0) {
                    result += `⏳ _Pending PO: ${stats.pendingPo} PR belum ada PO_\n`;
                }
            }
            result += `━━━━━━━━━━━━━━━━━━━━\n\n`;
        } else if (withAchievement && stats.totalPr > 0) {
            const catPrefix = categoryName !== 'ALL' ? `[Kategori ${categoryName}] ` : '';
            const eqText = stats.totalEquipments > 0 ? ` | ${stats.totalEquipments} Equipment` : '';
            result += `🎯 *${catPrefix}Achievement PR → PO: ${stats.achievement}%* (${stats.donePo}/${stats.totalPr} PR sudah proses PO | ${stats.pendingPo} PR pending${eqText})\n\n`;
        }

        const separator = (format === 'per_equipment' || format === 'detail') ? '\n\n' : '\n';
        result += lines.join(separator);

        if (withHeader) {
            result += `\n\n━━━━━━━━━━━━━━━━━━━━\n`;
            result += `_Plant CMMS System - Monitoring Orderan_`;
        }

        return result;
    };

    useEffect(() => {
        if (showWaModal) {
            setWaCustomText(generateWaText(activeWaList, waFormat, waWithNumber, waWithHeader, waWithProblem, waWithAchievement, waWithCategory, waCategory));
            setCopySuccess(false);
        }
    }, [showWaModal, activeWaList, waFormat, waWithNumber, waWithHeader, waWithProblem, waWithAchievement, waWithCategory, waCategory]);

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 3500);
    };

    const fallbackCopyText = (text, successMsg) => {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            showToast(successMsg);
            setCopySuccess(true);
        } catch (err) {
            alert('Gagal menyalin otomatis. Silakan salin teks di kotak preview secara manual.');
        }
        textArea.remove();
    };

    const copyToClipboard = (text, successMsg = 'Berhasil disalin ke clipboard!') => {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(() => {
                showToast(successMsg);
                setCopySuccess(true);
            }).catch(() => {
                fallbackCopyText(text, successMsg);
            });
        } else {
            fallbackCopyText(text, successMsg);
        }
    };

    const handleOpenWhatsAppWeb = () => {
        copyToClipboard(waCustomText, 'Teks berhasil disalin! Membuka WhatsApp Web...');
        if (waCustomText.length < 2500) {
            const url = `https://web.whatsapp.com/send?text=${encodeURIComponent(waCustomText)}`;
            window.open(url, '_blank');
        } else {
            window.open('https://web.whatsapp.com', '_blank');
        }
    };

    const handleCopySingleOrder = (order) => {
        const singleText = generateWaText([order], 'simple', false, false, false, false, waWithCategory, 'ALL');
        copyToClipboard(singleText, `📋 Disalin: ${singleText}`);
    };

    // FORM
    const [editMode, setEditMode] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        no_order: '',
        tanggal: new Date().toISOString().split('T')[0],
        unit_id: '',
        hm: '',
        component: '',
        component_name: '',
        lokasi: '',
        priority: 'BACKLOG',
        status: 'WAITING PART',
        pic: '',
        action_taken: '', // Remark / Keterangan
        root_cause: '', // Kondisi / Problem
        parts: [
            { part_number: '', description: '', life_time: '', qty: 1, satuan: 'Pcs', pr: '', po: '', due_date_part: '', swap_to_unit_id: '' }
        ]
    });

    const handleAddPart = () => {
        setData('parts', [...data.parts, { part_number: '', description: '', life_time: '', qty: 1, satuan: 'Pcs', pr: '', po: '', due_date_part: '', swap_to_unit_id: '' }]);
    };

    const handleRemovePart = (index) => {
        const newParts = [...data.parts];
        newParts.splice(index, 1);
        setData('parts', newParts);
    };

    const handlePartChange = (index, field, value) => {
        const newParts = [...data.parts];
        newParts[index][field] = value;
        setData('parts', newParts);
    };

    const handlePartNumberBlur = async (index) => {
        const partNumber = data.parts[index].part_number;
        const unitId = data.unit_id;
        const currentHm = data.hm;
        const orderId = selectedOrderId;

        if (partNumber && unitId && !['ATK', 'CONSUMABLE', 'TOOL'].includes(unitId)) {
            try {
                const response = await axios.get(route('monitoring-orderan.part-lifetime'), {
                    params: { unit_id: unitId, part_number: partNumber, current_hm: currentHm, order_id: orderId }
                });
                
                if (response.data.life_time !== null) {
                    const newParts = [...data.parts];
                    newParts[index].life_time = response.data.life_time;
                    setData('parts', newParts);
                }
            } catch (error) {
                console.error("Failed to fetch part lifetime", error);
            }
        }
    };

    useEffect(() => {
        const fetchHm = async () => {
            if (data.unit_id && data.tanggal && !['ATK', 'CONSUMABLE', 'TOOL'].includes(data.unit_id)) {
                try {
                    const response = await axios.get('/api/get-hm', {
                        params: { unit_id: data.unit_id, date: data.tanggal }
                    });
                    if (response.data.hm !== null) {
                        setData('hm', response.data.hm);
                    }
                } catch (error) {
                    console.error("Failed to fetch HM", error);
                }
            }
        };

        if (showCreateModal) {
            fetchHm();
        }
    }, [data.unit_id, data.tanggal, showCreateModal]);

    const handleUnitChange = (e) => {
        const val = e.target.value;
        const selectedUnit = units.find(u => u.id == val);
        
        setData(prev => ({
            ...prev,
            unit_id: val
        }));
    };

    const handleEdit = (order) => {
        setEditMode(true);
        setSelectedOrderId(order.id);
        
        let derivedUnitId = order.unit_id;
        let derivedLokasi = order.lokasi || '';
        if (!derivedUnitId && order.lokasi) {
            const nonUnits = ['ATK', 'CONSUMABLE', 'TOOL'];
            const found = nonUnits.find(v => order.lokasi.toUpperCase().startsWith(v));
            if (found) {
                derivedUnitId = found;
                // Strip the prefix (e.g. "ATK - " or "ATK") so it doesn't duplicate on save
                let prefixRegex = new RegExp(`^${found}\\s*(-\\s*)?`, 'i');
                derivedLokasi = derivedLokasi.replace(prefixRegex, '').trim();
            }
        }

        setData({
            no_order: order.no_order || '',
            tanggal: order.tanggal,
            unit_id: derivedUnitId || '',
            hm: order.hm || '',
            component: order.component || (order.parts && order.parts[0]?.component) || (order.parts && order.parts[0]?.department) || '',
            component_name: order.component_name || '',
            lokasi: derivedLokasi,
            priority: order.priority || 'BACKLOG',
            status: order.status || 'WAITING PART',
            pic: order.pic || '',
            action_taken: order.action_taken || '',
            root_cause: order.root_cause || '',
            parts: order.parts && order.parts.length > 0 ? order.parts.map(p => ({
                part_number: p.part_number || '',
                description: p.department || '',
                life_time: p.life_time || '',
                qty: p.qty || 1,
                satuan: 'Pcs',
                pr: p.pr || '',
                po: p.po || '',
                due_date_part: p.due_date_part || '',
                swap_to_unit_id: p.swap_to_unit_id || ''
            })) : [{ part_number: '', description: '', life_time: '', qty: 1, satuan: 'Pcs', pr: '', po: '', due_date_part: '', swap_to_unit_id: '' }]
        });
        
        setShowCreateModal(true);
    };

    const [selectedViewOrder, setSelectedViewOrder] = useState(null);
    const handleView = (order) => {
        setSelectedViewOrder(order);
    };

    const openCreateModal = () => {
        reset();
        setEditMode(false);
        setSelectedOrderId(null);
        setShowCreateModal(true);
    };

    const submitCreate = (e) => {
        e.preventDefault();
        if (editMode && selectedOrderId) {
            put(route('monitoring-orderan.update', selectedOrderId), {
                onSuccess: () => {
                    setShowCreateModal(false);
                    reset();
                },
                onError: (errs) => {
                    console.error("Update errors:", errs);
                    alert("Gagal menyimpan data. Periksa error: \n" + Object.values(errs).join('\n'));
                }
            });
        } else {
            post(route('monitoring-orderan.store'), {
                onSuccess: () => {
                    setShowCreateModal(false);
                    reset();
                },
                onError: (errs) => {
                    console.error("Store errors:", errs);
                    alert("Gagal membuat data. Periksa error: \n" + Object.values(errs).join('\n'));
                }
            });
        }
    };

    const deleteOrder = (id) => {
        if(confirm('Apakah Anda yakin ingin menghapus order ini?')) {
            router.delete(route('monitoring-orderan.destroy', id));
        }
    };

    const deleteAll = () => {
        if (confirm('⚠️ PERINGATAN ⚠️\n\nApakah Anda benar-benar yakin ingin MENGHAPUS SEMUA DATA Work Order? Tindakan ini tidak dapat dikembalikan!')) {
            router.delete(route('monitoring-orderan.destroy-all'));
        }
    };

    const fileInputRef = useRef(null);
    const handleImportClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const formData = new FormData();
            formData.append('file', e.target.files[0]);
            router.post(route('monitoring-orderan.import'), formData, {
                onSuccess: () => {
                    if(fileInputRef.current) fileInputRef.current.value = '';
                    alert('Proses impor berhasil diproses! Silakan periksa perubahan data Anda.');
                },
                onError: (errs) => {
                    if(fileInputRef.current) fileInputRef.current.value = '';
                    alert('Terdapat masalah saat impor:\n' + Object.values(errs).join('\n'));
                }
            });
        }
    };

    const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
    const templateDropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (templateDropdownRef.current && !templateDropdownRef.current.contains(event.target)) {
                setShowTemplateDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleDownloadTemplate = (type = 'all') => {
        setShowTemplateDropdown(false);
        window.location.href = route('monitoring-orderan.download-template') + (type !== 'all' ? `?type=${type}&` : '?') + 't=' + new Date().getTime();
    };

    const tabs = ['ORDERAN AKTIF', 'CANCEL ORDER', 'BACKLOG', 'HISTORICAL ORDER'];

    const getStatusBadge = (status) => {
        if(status === 'WAITING PART') return <span className="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-yellow-200 inline-block whitespace-nowrap">WAITING PART</span>;
        if(status === 'COMPLETED') return <span className="bg-green-100 text-green-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-green-200 inline-block whitespace-nowrap">COMPLETED</span>;
        if(status === 'CLOSED') return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-200 inline-block whitespace-nowrap">CLOSED</span>;
        if(status === 'PARTIAL') return <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-orange-200 inline-block whitespace-nowrap">PARTIAL</span>;
        if(status === 'CANCEL ORDER') return <span className="bg-red-100 text-red-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-red-200 inline-block whitespace-nowrap">CANCEL ORDER</span>;
        return <span className="bg-gray-100 text-gray-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-gray-200 inline-block whitespace-nowrap">{status}</span>;
    };

    const getPriorityBadge = (prio) => {
        if(prio === 'HIGH' || prio === 'P1') return <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm inline-block">P1</span>;
        if(prio === 'MEDIUM' || prio === 'P2') return <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm inline-block">P2</span>;
        if(prio === 'LOW' || prio === 'P3') return <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm inline-block">P3</span>;
        if(prio === 'BACKLOG') return <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm inline-block">BACKLOG</span>;
        return <span className="text-gray-400 text-xs">{prio || '-'}</span>;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Monitoring Order List" />

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Monitoring Order List</h1>
                        <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                            <span className="text-green-600">Home</span> &gt; <span>Planner</span> &gt; <span>Monitoring Order List</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {isAdmin && (
                            <button onClick={deleteAll} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow flex items-center gap-2 transition" title="Hapus Semua Data">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                        )}
                        
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".xlsx,.xls" />
                        
                        {/* Dropdown Template */}
                        <div className="relative inline-block text-left" ref={templateDropdownRef}>
                            <div className="inline-flex rounded-lg shadow-sm">
                                <button 
                                    type="button"
                                    onClick={() => handleDownloadTemplate('all')} 
                                    className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3.5 py-2 rounded-l-lg text-sm font-bold flex items-center gap-2 transition" 
                                    title="Download Template (Semua Sheet)"
                                >
                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                    Template
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setShowTemplateDropdown(!showTemplateDropdown)} 
                                    className="bg-white border border-l-0 border-gray-300 hover:bg-gray-50 text-gray-600 px-2 py-2 rounded-r-lg text-sm transition"
                                    title="Pilih Jenis Template"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </button>
                            </div>

                            {showTemplateDropdown && (
                                <div className="origin-top-right absolute right-0 mt-2 w-72 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 z-50 animate-in fade-in slide-in-from-top-1">
                                    <div className="p-1.5 space-y-1">
                                        <button
                                            onClick={() => handleDownloadTemplate('all')}
                                            className="w-full text-left px-3 py-2 text-xs font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg flex items-center gap-2 transition"
                                        >
                                            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                                            <div>
                                                <div>Semua Sheet (PO/ETA & Barang Datang)</div>
                                                <div className="text-[10px] text-gray-400 font-normal">File Excel 2 sheet lengkap</div>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => handleDownloadTemplate('po_eta')}
                                            className="w-full text-left px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg flex items-center gap-2 transition"
                                        >
                                            <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                                            <div>
                                                <div className="font-bold">Sheet 1: Update PO & ETA (by PR)</div>
                                                <div className="text-[10px] text-gray-400 font-normal">Update No PO & Estimasi Tiba</div>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => handleDownloadTemplate('barang_datang')}
                                            className="w-full text-left px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded-lg flex items-center gap-2 transition"
                                        >
                                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                                            <div>
                                                <div className="font-bold">Sheet 2: Barang Datang (Closed Order)</div>
                                                <div className="text-[10px] text-emerald-600 font-normal">Otomatis CLOSED & Masuk Historical</div>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button onClick={handleImportClick} className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 transition" title="Import Data">
                            <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                            Import
                        </button>

                        <Link href="/part-order-lifetime" className="bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-2 rounded-lg text-sm font-bold shadow flex items-center gap-2 transition" title="Smart Part Order & Lifetime Management">
                            <svg className="w-4 h-4 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                            Smart Lifetime
                        </Link>
                        <Link href={route('monitoring-orderan.create')} className="bg-[#0f5132] hover:bg-[#146c43] text-white px-4 py-2 rounded-lg text-sm font-bold shadow flex items-center gap-2 transition">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                            Create Order
                        </Link>
                        <button 
                            onClick={() => setShowWaModal(true)} 
                            className="bg-[#25D366] hover:bg-[#20bd5a] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 transition"
                            title="Copy Semua Data Belum Datang ke WhatsApp"
                        >
                            <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.772.82 2.791.82 3.184 0 5.77-2.587 5.77-5.766.001-3.182-2.585-5.769-5.77-5.769zm3.363 8.163c-.144.405-.837.774-1.17.822-.313.044-.633.08-1.503-.277-1.238-.507-2.029-1.764-2.09-1.846-.062-.082-.497-.66-.497-1.258 0-.598.314-.892.425-1.013.11-.12.242-.152.323-.152.08 0 .161.002.23.006.073.003.171-.028.267.202.1.242.341.83.371.891.03.061.05.132.01.212-.04.08-.06.13-.121.202-.06.07-.127.158-.182.212-.06.06-.123.125-.053.245.07.12.311.514.667.831.458.408.845.535.965.595.12.06.191.05.262-.03.07-.08.303-.353.384-.474.08-.12.161-.101.272-.06.111.04.706.333.827.394.12.06.201.09.231.141.03.05.03.525-.114.93zM12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.66 1.444 5.176L2 22l4.981-1.306A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.636 0-3.153-.487-4.423-1.325l-.317-.208-2.96.776.79-2.884-.228-.363A7.95 7.95 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>
                            </svg>
                            Copy WA
                        </button>
                        <button 
                            type="button"
                            onClick={() => {
                                const params = new URLSearchParams();
                                if (colFilter.no_order) params.set('no_order', colFilter.no_order);
                                if (search) params.set('search', search);
                                if (statusFilter) params.set('status', statusFilter);
                                if (dateFrom) params.set('dateFrom', dateFrom);
                                if (dateTo) params.set('dateTo', dateTo);
                                window.location.href = route('monitoring-orderan.export-excel') + (params.toString() ? `?${params.toString()}` : '');
                            }}
                            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 transition cursor-pointer"
                            title="Export Data ke Excel"
                        >
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            Export Excel
                        </button>
                        <button 
                            type="button"
                            onClick={() => setShowPrintMolModal(true)}
                            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 transition cursor-pointer"
                            title="Download PDF, Excel, atau Print Dokumen per Nomor Order"
                        >
                            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                            Download &amp; Print MOL
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 mb-6 gap-6 overflow-x-auto">
                    {tabs.map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 font-bold text-sm tracking-wide border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === tab ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            {tab === 'ORDERAN AKTIF' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>}
                            {tab === 'CANCEL ORDER' && <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                            {tab === 'BACKLOG' && <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path></svg>}
                            {tab === 'HISTORICAL ORDER' && <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                            {tab}
                        </button>
                    ))}
                </div>



                <div className="flex flex-wrap items-center gap-4 text-sm mb-4 bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                    <span className="font-bold text-gray-700 uppercase">PROGRESS ORDER :</span>
                    <div className="flex items-center gap-1.5"><span className="bg-yellow-100 text-yellow-800 font-bold px-2 py-0.5 rounded text-xs">WAITING PART</span> = Menunggu Part</div>
                    <div className="flex items-center gap-1.5"><span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-xs">CLOSED</span> = Barang Datang / Selesai (Masuk Historical)</div>
                    <div className="flex items-center gap-1.5"><span className="bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded text-xs">COMPLETED</span> = Selesai (Masuk Historical)</div>
                    <div className="flex items-center gap-1.5"><span className="bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded text-xs">CANCEL ORDER</span> = Dibatalkan (Masuk Historical)</div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                        <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200 uppercase tracking-wide">
                            <tr>
                                <th className="px-2 py-2 text-center text-[11px] font-bold text-gray-700 w-10">No</th>
                                <th className="px-2 py-2 text-[11px] font-bold text-gray-700">No Order</th>
                                <th className="px-2 py-2 text-[11px] font-bold text-gray-700">Code Unit</th>
                                <th className="px-2 py-2 text-[11px] font-bold text-gray-700">Type Unit</th>
                                <th className="px-2.5 py-2 text-[11px] font-bold text-gray-700">Component Name</th>
                                <th className="px-2 py-2 text-[11px] font-bold text-gray-700">Order By</th>
                                <th className="px-1.5 py-2 text-center text-[11px] font-bold text-gray-700">Kategori</th>
                                <th className="px-2 py-2 text-[11px] font-bold text-gray-700">Swap To Unit</th>
                                <th className="px-2 py-2 text-[11px] font-bold text-gray-700">Date</th>
                                <th className="px-2 py-2 text-[11px] font-bold text-gray-700">PR</th>
                                <th className="px-2 py-2 text-[11px] font-bold text-gray-700">PO</th>
                                <th className="px-2 py-2 text-[11px] font-bold text-gray-700">ETA Part</th>
                                <th className="px-2 py-2 text-center text-[11px] font-bold text-gray-700">Progress Order</th>
                                <th className="px-2 py-2 text-center text-[11px] font-bold text-gray-700 min-w-[155px]">Action</th>
                            </tr>
                            {/* Filter Row */}
                            <tr className="bg-white border-b border-gray-200">
                                <th className="px-1 py-1 text-center"></th>

                                {/* NO ORDER */}
                                <th className="px-1.5 py-1 min-w-[105px]">
                                    <select 
                                        value={colFilter.no_order} 
                                        onChange={e => setCol('no_order', e.target.value)} 
                                        className="w-full text-[11px] h-7 border border-gray-300 rounded px-1 py-0.5 focus:ring-1 focus:ring-green-400 focus:border-green-400 font-normal bg-white"
                                    >
                                        <option value="">Semua</option>
                                        {filterOptions.no_order.map(val => (
                                            <option key={val} value={val}>{val}</option>
                                        ))}
                                    </select>
                                </th>

                                {/* CODE UNIT */}
                                <th className="px-1.5 py-1 min-w-[85px]">
                                    <select 
                                        value={colFilter.code_unit} 
                                        onChange={e => setCol('code_unit', e.target.value)} 
                                        className="w-full text-[11px] h-7 border border-gray-300 rounded px-1 py-0.5 focus:ring-1 focus:ring-green-400 focus:border-green-400 font-normal bg-white"
                                    >
                                        <option value="">Semua</option>
                                        {filterOptions.code_unit.map(val => (
                                            <option key={val} value={val}>{val}</option>
                                        ))}
                                    </select>
                                </th>

                                {/* TYPE UNIT */}
                                <th className="px-1.5 py-1 min-w-[95px]">
                                    <select 
                                        value={colFilter.type_unit} 
                                        onChange={e => setCol('type_unit', e.target.value)} 
                                        className="w-full text-[11px] h-7 border border-gray-300 rounded px-1 py-0.5 focus:ring-1 focus:ring-green-400 focus:border-green-400 font-normal bg-white"
                                    >
                                        <option value="">Semua</option>
                                        {filterOptions.type_unit.map(val => (
                                            <option key={val} value={val}>{val}</option>
                                        ))}
                                    </select>
                                </th>

                                {/* COMPONENT NAME */}
                                <th className="px-1.5 py-1 min-w-[120px]">
                                    <select 
                                        value={colFilter.component} 
                                        onChange={e => setCol('component', e.target.value)} 
                                        className="w-full text-[11px] h-7 border border-gray-300 rounded px-1 py-0.5 focus:ring-1 focus:ring-green-400 focus:border-green-400 font-normal bg-white"
                                    >
                                        <option value="">Semua</option>
                                        {filterOptions.component.map(val => (
                                            <option key={val} value={val}>{val}</option>
                                        ))}
                                    </select>
                                </th>

                                {/* ORDER BY */}
                                <th className="px-1.5 py-1 min-w-[100px]">
                                    <select 
                                        value={colFilter.order_by} 
                                        onChange={e => setCol('order_by', e.target.value)} 
                                        className="w-full text-[11px] h-7 border border-gray-300 rounded px-1 py-0.5 focus:ring-1 focus:ring-green-400 focus:border-green-400 font-normal bg-white"
                                    >
                                        <option value="">Semua</option>
                                        {filterOptions.order_by.map(val => (
                                            <option key={val} value={val}>{val}</option>
                                        ))}
                                    </select>
                                </th>

                                {/* PRIORITY */}
                                <th className="px-1.5 py-1 min-w-[70px]">
                                    <select 
                                        value={colFilter.priority} 
                                        onChange={e => setCol('priority', e.target.value)} 
                                        className="w-full text-[11px] h-7 border border-gray-300 rounded px-1 py-0.5 focus:ring-1 focus:ring-green-400 focus:border-green-400 font-normal bg-white"
                                    >
                                        <option value="">Semua</option>
                                        <option value="P1">P1</option>
                                        <option value="P2">P2</option>
                                        <option value="P3">P3</option>
                                        <option value="BACKLOG">Backlog</option>
                                    </select>
                                </th>

                                {/* SWAP TO UNIT */}
                                <th className="px-1.5 py-1 min-w-[85px]">
                                    <select 
                                        value={colFilter.swap_to_unit} 
                                        onChange={e => setCol('swap_to_unit', e.target.value)} 
                                        className="w-full text-[11px] h-7 border border-gray-300 rounded px-1 py-0.5 focus:ring-1 focus:ring-green-400 focus:border-green-400 font-normal bg-white"
                                    >
                                        <option value="">Semua</option>
                                        {filterOptions.swap_to_unit.map(val => (
                                            <option key={val} value={val}>{val}</option>
                                        ))}
                                    </select>
                                </th>

                                {/* DATE */}
                                <th className="px-1.5 py-1 min-w-[85px]">
                                    <select 
                                        value={colFilter.date} 
                                        onChange={e => setCol('date', e.target.value)} 
                                        className="w-full text-[11px] h-7 border border-gray-300 rounded px-1 py-0.5 focus:ring-1 focus:ring-green-400 focus:border-green-400 font-normal bg-white"
                                    >
                                        <option value="">Semua</option>
                                        {filterOptions.date.map(val => (
                                            <option key={val} value={val}>{val}</option>
                                        ))}
                                    </select>
                                </th>

                                {/* PR */}
                                <th className="px-1.5 py-1 min-w-[85px]">
                                    <select 
                                        value={colFilter.pr} 
                                        onChange={e => setCol('pr', e.target.value)} 
                                        className={`w-full text-[11px] h-7 border rounded px-1 py-0.5 focus:ring-1 focus:ring-green-400 focus:border-green-400 font-normal transition-colors ${
                                            colFilter.pr ? 'border-amber-400 bg-amber-50/70 font-bold text-amber-900' : 'border-gray-300 bg-white'
                                        }`}
                                    >
                                        <option value="">Semua</option>
                                        <option value="__EMPTY__">Belum ada PR</option>
                                        <option value="__EXISTS__">Ada PR</option>
                                        {filterOptions.pr.map(val => (
                                            <option key={val} value={val}>{val}</option>
                                        ))}
                                    </select>
                                </th>

                                {/* PO */}
                                <th className="px-1.5 py-1 min-w-[90px]">
                                    <select 
                                        value={colFilter.po} 
                                        onChange={e => setCol('po', e.target.value)} 
                                        className="w-full text-[11px] h-7 border border-gray-300 rounded px-1 py-0.5 focus:ring-1 focus:ring-green-400 focus:border-green-400 font-normal bg-white font-mono"
                                    >
                                        <option value="">Semua</option>
                                        <option value="__EMPTY__" className="font-sans text-amber-600 font-semibold">⚠️ Belum Ada PO</option>
                                        {filterOptions.po.map(val => (
                                            <option key={val} value={val}>{val}</option>
                                        ))}
                                    </select>
                                </th>

                                {/* ETA PART */}
                                <th className="px-1.5 py-1 min-w-[90px]">
                                    <select 
                                        value={colFilter.eta_part} 
                                        onChange={e => setCol('eta_part', e.target.value)} 
                                        className="w-full text-[11px] h-7 border border-gray-300 rounded px-1 py-0.5 focus:ring-1 focus:ring-green-400 focus:border-green-400 font-normal bg-white"
                                    >
                                        <option value="">Semua</option>
                                        <option value="__EMPTY__" className="text-amber-600 font-semibold">⚠️ Belum Ada ETA Part</option>
                                        {filterOptions.eta_part.map(val => (
                                            <option key={val} value={val}>{val}</option>
                                        ))}
                                    </select>
                                </th>

                                {/* PROGRESS ORDER */}
                                <th className="px-1.5 py-1 min-w-[105px]">
                                    <select 
                                        value={colFilter.progress} 
                                        onChange={e => setCol('progress', e.target.value)} 
                                        className="w-full text-[11px] h-7 border border-gray-300 rounded px-1 py-0.5 focus:ring-1 focus:ring-green-400 focus:border-green-400 font-normal bg-white"
                                    >
                                        <option value="">Semua</option>
                                        <option value="WAITING PART">WAITING PART</option>
                                        <option value="CLOSED">CLOSED</option>
                                        <option value="COMPLETED">COMPLETED</option>
                                        <option value="CANCEL ORDER">CANCEL ORDER</option>
                                    </select>
                                </th>

                                {/* RESET BUTTON */}
                                <th className="px-1 py-1 text-center min-w-[155px]">
                                    <button onClick={resetColFilters} title="Reset filter kolom" className="text-red-500 hover:text-red-700 text-[10px] font-bold border border-red-200 hover:bg-red-50 rounded px-1.5 py-0.5 transition">✕ Reset</button>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-600">
                            {filteredOrders.length === 0 && (
                                <tr>
                                    <td colSpan={14} className="px-4 py-8 text-center text-gray-400 text-xs font-medium">
                                        Tidak ada data orderan yang sesuai
                                    </td>
                                </tr>
                            )}
                            {filteredOrders.map((order, idx) => {
                                const parts = order.parts || [];
                                const validEtas = Array.from(new Set(parts.map(p => p.due_date_part).filter(p => p && p.trim() !== '' && p.trim() !== '-' && p !== '1970-01-01')));
                                const validPrs = Array.from(new Set(parts.map(p => p.pr).filter(p => p && p.trim() !== '' && p.trim() !== '-')));
                                const validPos = Array.from(new Set(parts.map(p => p.po).filter(p => p && p.trim() !== '' && p.trim() !== '-')));
                                const validSwaps = Array.from(new Set(parts.map(p => p.swap_to_unit?.code_unit).filter(Boolean)));
                                const compName = order.component_name || order.component || parts.map(p => p.component || p.department).filter(c => c && c.trim() !== '' && c !== '-')[0] || '-';

                                return (
                                    <tr 
                                        key={order.id} 
                                        onClick={() => handleView(order)} 
                                        onDoubleClick={() => router.visit(route('monitoring-orderan.edit', order.id) + (typeof window !== 'undefined' ? '?return_to=' + encodeURIComponent(window.location.pathname + window.location.search) : ''))} 
                                        className="hover:bg-emerald-50/50 transition-colors cursor-pointer group"
                                        title="Klik untuk melihat detail unit & order | Klik 2x untuk edit"
                                    >
                                        <td className="px-2 py-1.5 text-center text-gray-400 text-xs">{idx + 1}</td>
                                        <td className="px-2 py-1.5 font-bold text-gray-900 tracking-tight text-xs">{order.no_order}</td>
                                        <td className="px-2 py-1.5 font-semibold text-gray-800 text-xs">
                                            {order.unit?.code_unit || (['ATK','CONSUMABLE','TOOL'].find(v => order.lokasi?.toUpperCase().startsWith(v))) || '-'}
                                        </td>
                                        <td className="px-2 py-1.5 text-gray-600 text-xs">{order.unit?.type_unit || '-'}</td>
                                        <td className="px-2.5 py-1.5 font-medium text-gray-800 text-xs">
                                            <div>{compName}</div>
                                            {order.component_name && order.component && order.component !== order.component_name && (
                                                <div className="text-[10px] text-gray-400 font-normal uppercase leading-tight">{order.component}</div>
                                            )}
                                        </td>
                                        <td className="px-2 py-1.5 text-gray-700 text-xs">{order.pic || '-'}</td>
                                        <td className="px-1.5 py-1.5 text-center">{getPriorityBadge(order.priority)}</td>
                                        <td className="px-2 py-1.5 font-medium text-blue-600 text-xs">
                                            {validSwaps.length > 0 ? validSwaps.join(', ') : '-'}
                                        </td>
                                        <td className="px-2 py-1.5 text-gray-600 text-xs">{order.tanggal}</td>
                                        <td className="px-2 py-1.5 font-mono text-gray-600 text-[11px]">
                                            {validPrs.length > 0 ? (
                                                <div className="flex flex-col gap-0.5">
                                                    {validPrs.map((pr, i) => <span key={i} className="whitespace-nowrap">{pr}</span>)}
                                                </div>
                                            ) : (
                                                <span className="text-amber-600 bg-amber-50 px-1 py-0.5 rounded text-[10px] font-bold">Belum PR</span>
                                            )}
                                        </td>
                                        <td className="px-2 py-1.5 font-mono text-gray-600 text-[11px]">
                                            {validPos.length > 0 ? (
                                                <div className="flex flex-col gap-0.5">
                                                    {validPos.map((po, i) => <span key={i} className="whitespace-nowrap font-medium text-gray-800">{po}</span>)}
                                                </div>
                                            ) : '-'}
                                        </td>
                                        <td className="px-2 py-1.5 font-medium text-gray-800 text-xs">
                                            {validEtas.length > 0 ? (
                                                <div className="flex flex-col gap-0.5">
                                                    {validEtas.map((eta, i) => (
                                                        <span key={i} className="whitespace-nowrap font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 py-0.5 rounded text-[11px] inline-block w-fit">
                                                            {eta}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 font-normal">-</span>
                                            )}
                                        </td>
                                        <td className="px-2 py-1.5 text-center">{getStatusBadge(order.status)}</td>
                                        <td className="px-1.5 py-1.5 text-center" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-center gap-1">
                                                <button onClick={(e) => { e.stopPropagation(); handleCopySingleOrder(order); }} className="text-emerald-600 hover:bg-emerald-50 p-1 rounded border border-emerald-200 transition" title="Copy Order ini ke WA">
                                                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                                        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.772.82 2.791.82 3.184 0 5.77-2.587 5.77-5.766.001-3.182-2.585-5.769-5.77-5.769zm3.363 8.163c-.144.405-.837.774-1.17.822-.313.044-.633.08-1.503-.277-1.238-.507-2.029-1.764-2.09-1.846-.062-.082-.497-.66-.497-1.258 0-.598.314-.892.425-1.013.11-.12.242-.152.323-.152.08 0 .161.002.23.006.073.003.171-.028.267.202.1.242.341.83.371.891.03.061.05.132.01.212-.04.08-.06.13-.121.202-.06.07-.127.158-.182.212-.06.06-.123.125-.053.245.07.12.311.514.667.831.458.408.845.535.965.595.12.06.191.05.262-.03.07-.08.303-.353.384-.474.08-.12.161-.101.272-.06.111.04.706.333.827.394.12.06.201.09.231.141.03.05.03.525-.114.93zM12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.66 1.444 5.176L2 22l4.981-1.306A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.636 0-3.153-.487-4.423-1.325l-.317-.208-2.96.776.79-2.884-.228-.363A7.95 7.95 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>
                                                    </svg>
                                                </button>
                                                <button 
                                                    type="button" 
                                                    onClick={(e) => { e.stopPropagation(); handleView(order); }} 
                                                    className="text-blue-600 hover:bg-blue-50 p-1 rounded border border-blue-200 transition block" 
                                                    title="Quick View Detail"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                                </button>
                                                {/* PDF */}
                                                <button 
                                                    type="button" 
                                                    onClick={(e) => { 
                                                        e.stopPropagation(); 
                                                        window.open(route('monitoring-orderan.pdf', order.id) + '?download=1', '_blank'); 
                                                    }} 
                                                    className="text-rose-600 hover:bg-rose-50 p-1 rounded border border-rose-200 transition block cursor-pointer" 
                                                    title={`Download PDF MOL (${order.no_order})`}
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                                </button>
                                                {/* Excel */}
                                                <button 
                                                    type="button" 
                                                    onClick={(e) => { 
                                                        e.stopPropagation(); 
                                                        window.location.href = route('monitoring-orderan.excel', order.id); 
                                                    }} 
                                                    className="text-emerald-600 hover:bg-emerald-50 p-1 rounded border border-emerald-200 transition block cursor-pointer" 
                                                    title={`Download Excel MOL (${order.no_order})`}
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                </button>
                                                {/* Print */}
                                                <button 
                                                    type="button" 
                                                    onClick={(e) => { 
                                                        e.stopPropagation(); 
                                                        window.open(route('monitoring-orderan.print', order.id) + '?autoprint=1', '_blank'); 
                                                    }} 
                                                    className="text-purple-600 hover:bg-purple-50 p-1 rounded border border-purple-200 transition block cursor-pointer" 
                                                    title={`Cetak / Print MOL (${order.no_order})`}
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                                    </svg>
                                                </button>
                                                {/* Edit */}
                                                <Link 
                                                    href={route('monitoring-orderan.edit', order.id) + (typeof window !== 'undefined' ? '?return_to=' + encodeURIComponent(window.location.pathname + window.location.search) : '')} 
                                                    className="text-green-600 hover:bg-green-50 p-1 rounded border border-green-200 transition block cursor-pointer" 
                                                    title="Edit"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                                </Link>
                                                {/* Delete */}
                                                <button onClick={(e) => { e.stopPropagation(); deleteOrder(order.id); }} className="text-red-600 hover:bg-red-50 p-1 rounded border border-red-200 transition cursor-pointer" title="Delete">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick View Order Detail Modal */}
            {selectedViewOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-gray-200 overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="bg-[#0f5132] text-white px-6 py-4 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold text-lg">
                                    🚜
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-black tracking-tight text-white">{selectedViewOrder.no_order}</h3>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 font-bold">
                                            {selectedViewOrder.unit?.code_unit || selectedViewOrder.lokasi || '-'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-green-100 font-medium">
                                        {selectedViewOrder.unit?.type_unit || 'Equipment'} • Tanggal: {selectedViewOrder.tanggal} • HM: {selectedViewOrder.hm || '-'}
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedViewOrder(null)}
                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition text-white font-bold"
                                title="Keluar / Tutup"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto space-y-4 custom-scrollbar">
                            {/* Info Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-200 text-xs">
                                <div>
                                    <span className="text-gray-400 block font-medium">Kategori / Prioritas:</span>
                                    <span className="font-bold text-gray-800">{getPriorityBadge(selectedViewOrder.priority)}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block font-medium">Status Order:</span>
                                    <span className="font-bold">{getStatusBadge(selectedViewOrder.status)}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block font-medium">Order By (PIC):</span>
                                    <span className="font-bold text-gray-800">{selectedViewOrder.pic || '-'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block font-medium">Komponen:</span>
                                    <span className="font-bold text-gray-800">{selectedViewOrder.component_name || selectedViewOrder.component || '-'}</span>
                                </div>
                            </div>

                            {/* Problem & Action Taken */}
                            {(selectedViewOrder.root_cause || selectedViewOrder.action_taken) && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {selectedViewOrder.root_cause && (
                                        <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3 text-xs">
                                            <div className="font-bold text-amber-800 mb-1">⚠️ Problem / Kerusakan:</div>
                                            <div className="text-gray-700 whitespace-pre-line">{selectedViewOrder.root_cause}</div>
                                        </div>
                                    )}
                                    {selectedViewOrder.action_taken && (
                                        <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3 text-xs">
                                            <div className="font-bold text-blue-800 mb-1">🛠️ Tindakan / Remarks:</div>
                                            <div className="text-gray-700 whitespace-pre-line">{selectedViewOrder.action_taken}</div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Part Items List */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                                        Daftar Part & Pengadaan ({selectedViewOrder.parts?.length || 0} Item)
                                    </h4>
                                </div>
                                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-xs">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-gray-100/70 text-gray-700 font-bold border-b border-gray-200 text-[11px] uppercase">
                                            <tr>
                                                <th className="px-3 py-2">Component</th>
                                                <th className="px-3 py-2">Part Number</th>
                                                <th className="px-3 py-2">Description</th>
                                                <th className="px-2 py-2 text-center">Qty</th>
                                                <th className="px-3 py-2">No PR</th>
                                                <th className="px-3 py-2">No PO</th>
                                                <th className="px-3 py-2">ETA Part</th>
                                                <th className="px-3 py-2">Swap Unit</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 text-gray-700">
                                            {(selectedViewOrder.parts || []).map((part, pIdx) => (
                                                <tr key={pIdx} className="hover:bg-gray-50/80">
                                                    <td className="px-3 py-2 font-medium text-gray-900">
                                                        <span className="font-bold">{part.component || selectedViewOrder.component || '-'}</span>
                                                        {part.component_name && part.component_name !== '-' && part.component_name !== part.component && (
                                                            <div className="text-[11px] text-gray-500">{part.component_name}</div>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2 font-mono font-bold text-gray-900">{part.part_number || '-'}</td>
                                                    <td className="px-3 py-2 font-medium">{part.department || '-'}</td>
                                                    <td className="px-2 py-2 text-center font-bold">{part.qty || 1} {part.satuan || 'Pcs'}</td>
                                                    <td className="px-3 py-2 font-mono">
                                                        {part.pr ? (
                                                            <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200 font-bold">{part.pr}</span>
                                                        ) : (
                                                            <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 text-[10px] font-bold">Belum ada PR</span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2 font-mono">
                                                        {part.po ? (
                                                            <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200 font-bold">{part.po}</span>
                                                        ) : (
                                                            <span className="text-gray-400">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        {part.due_date_part && part.due_date_part !== '-' && part.due_date_part !== '1970-01-01' ? (
                                                            <span className="bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200 font-semibold">{part.due_date_part}</span>
                                                        ) : (
                                                            <span className="text-gray-400">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2 text-blue-600 font-semibold">
                                                        {part.swap_to_unit?.code_unit || '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-gray-50 px-6 py-3.5 border-t border-gray-200 flex items-center justify-between shrink-0">
                            <button
                                type="button"
                                onClick={() => setSelectedViewOrder(null)}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-lg text-xs transition cursor-pointer"
                            >
                                Keluar / Tutup
                            </button>
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => window.open(route('monitoring-orderan.pdf', selectedViewOrder.id) + '?download=1', '_blank')}
                                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                                    title={`Unduh PDF Dokumen MOL (${selectedViewOrder.no_order})`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                    <span>Unduh PDF</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { window.location.href = route('monitoring-orderan.excel', selectedViewOrder.id); }}
                                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                                    title={`Unduh Excel Dokumen MOL (${selectedViewOrder.no_order})`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    <span>Unduh Excel</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => window.open(route('monitoring-orderan.print', selectedViewOrder.id) + '?autoprint=1', '_blank')}
                                    className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                                    title={`Cetak Dokumen MOL (${selectedViewOrder.no_order})`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                    </svg>
                                    <span>Print MOL</span>
                                </button>
                                <Link
                                    href={route('monitoring-orderan.edit', selectedViewOrder.id) + (typeof window !== 'undefined' ? '?return_to=' + encodeURIComponent(window.location.pathname + window.location.search) : '')}
                                    className="px-4 py-2 bg-[#0f5132] hover:bg-[#146c43] text-white font-bold rounded-lg text-xs transition shadow-sm flex items-center gap-1.5"
                                >
                                    <span>Edit</span>
                                    <span>&rarr;</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* WA Sharing Modal */}
            {showWaModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200">
                        {/* Modal Header */}
                        <div className="bg-[#25D366] text-white px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                    <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                                        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.772.82 2.791.82 3.184 0 5.77-2.587 5.77-5.766.001-3.182-2.585-5.769-5.77-5.769zm3.363 8.163c-.144.405-.837.774-1.17.822-.313.044-.633.08-1.503-.277-1.238-.507-2.029-1.764-2.09-1.846-.062-.082-.497-.66-.497-1.258 0-.598.314-.892.425-1.013.11-.12.242-.152.323-.152.08 0 .161.002.23.006.073.003.171-.028.267.202.1.242.341.83.371.891.03.061.05.132.01.212-.04.08-.06.13-.121.202-.06.07-.127.158-.182.212-.06.06-.123.125-.053.245.07.12.311.514.667.831.458.408.845.535.965.595.12.06.191.05.262-.03.07-.08.303-.353.384-.474.08-.12.161-.101.272-.06.111.04.706.333.827.394.12.06.201.09.231.141.03.05.03.525-.114.93zM12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.66 1.444 5.176L2 22l4.981-1.306A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.636 0-3.153-.487-4.423-1.325l-.317-.208-2.96.776.79-2.884-.228-.363A7.95 7.95 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-black tracking-tight">Copy Data Belum Datang ke WhatsApp</h3>
                                    <p className="text-xs text-green-100 font-medium">Format pesan rapi dan siap dikirim ke grup WhatsApp koordinasi</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowWaModal(false)}
                                className="w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition text-white"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-4">
                            {/* Scope & Format Options */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Pilihan Data:</label>
                                    <div className="flex rounded-lg bg-gray-200 p-0.5 text-xs font-semibold">
                                        <button
                                            type="button"
                                            onClick={() => setWaScope('filtered')}
                                            className={`flex-1 py-1.5 px-2 rounded-md transition ${waScope === 'filtered' ? 'bg-white text-gray-900 shadow-sm font-bold' : 'text-gray-600 hover:text-gray-900'}`}
                                        >
                                            Sesuai Filter ({filteredBelumDatang.length})
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setWaScope('all_active')}
                                            className={`flex-1 py-1.5 px-2 rounded-md transition ${waScope === 'all_active' ? 'bg-white text-gray-900 shadow-sm font-bold' : 'text-gray-600 hover:text-gray-900'}`}
                                        >
                                            Semua Belum Datang ({allBelumDatang.length})
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Format Pesan:</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 rounded-lg bg-gray-200 p-0.5 text-xs font-semibold gap-0.5">
                                        <button
                                            type="button"
                                            onClick={() => setWaFormat('per_equipment')}
                                            className={`py-1.5 px-2 rounded-md transition text-center ${waFormat === 'per_equipment' ? 'bg-white text-gray-900 shadow-sm font-bold' : 'text-gray-600 hover:text-gray-900'}`}
                                        >
                                            🚜 Per Equipment
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setWaFormat('simple')}
                                            className={`py-1.5 px-2 rounded-md transition text-center ${waFormat === 'simple' ? 'bg-white text-gray-900 shadow-sm font-bold' : 'text-gray-600 hover:text-gray-900'}`}
                                        >
                                            1 Baris Flat
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setWaFormat('per_part')}
                                            className={`py-1.5 px-2 rounded-md transition text-center ${waFormat === 'per_part' ? 'bg-white text-gray-900 shadow-sm font-bold' : 'text-gray-600 hover:text-gray-900'}`}
                                        >
                                            Per Item Part
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setWaFormat('detail')}
                                            className={`py-1.5 px-2 rounded-md transition text-center ${waFormat === 'detail' ? 'bg-white text-gray-900 shadow-sm font-bold' : 'text-gray-600 hover:text-gray-900'}`}
                                        >
                                            Detail Lengkap
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Kategori Filter (Semua, P1, P2, P3, Backlog) */}
                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                                    <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1.5">
                                        <span>Kategori:</span>
                                        <span className="text-[10px] text-gray-400 font-normal font-sans">(Filter data sesuai kategori prioritas)</span>
                                    </label>
                                    <span className="text-[11px] font-semibold text-emerald-700">
                                        Terpilih: {waCategory === 'ALL' ? 'Semua Kategori' : waCategory} ({activeWaList.length} Order)
                                    </span>
                                </div>
                                <div className="grid grid-cols-5 gap-1.5 bg-gray-200 p-1 rounded-lg text-xs font-bold">
                                    {[
                                        { id: 'ALL', label: 'Semua', count: categoryCounts.ALL, color: 'text-gray-800' },
                                        { id: 'P1', label: 'P1', count: categoryCounts.P1, color: 'text-red-600' },
                                        { id: 'P2', label: 'P2', count: categoryCounts.P2, color: 'text-orange-600' },
                                        { id: 'P3', label: 'P3', count: categoryCounts.P3, color: 'text-blue-600' },
                                        { id: 'BACKLOG', label: 'Backlog', count: categoryCounts.BACKLOG, color: 'text-blue-800' },
                                    ].map(cat => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => setWaCategory(cat.id)}
                                            className={`py-1.5 px-2 rounded-md transition text-center flex flex-col sm:flex-row items-center justify-center gap-1 ${waCategory === cat.id ? 'bg-white shadow-sm font-black ' + cat.color : 'text-gray-600 hover:text-gray-900'}`}
                                        >
                                            <span>{cat.label}</span>
                                            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${waCategory === cat.id ? 'bg-gray-100 font-extrabold' : 'bg-gray-300/70 text-gray-600'}`}>
                                                {cat.count}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Additional Toggles */}
                            <div className="flex flex-wrap items-center gap-5 px-1 text-xs text-gray-700">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={waWithNumber}
                                        onChange={(e) => setWaWithNumber(e.target.checked)}
                                        className="rounded border-gray-300 text-[#25D366] focus:ring-[#25D366]"
                                    />
                                    <span className="font-semibold">Sertakan Nomor Urut (1, 2, 3...)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={waWithHeader}
                                        onChange={(e) => setWaWithHeader(e.target.checked)}
                                        className="rounded border-gray-300 text-[#25D366] focus:ring-[#25D366]"
                                    />
                                    <span className="font-semibold">Sertakan Judul & Tanggal</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={waWithAchievement}
                                        onChange={(e) => setWaWithAchievement(e.target.checked)}
                                        className="rounded border-gray-300 text-[#25D366] focus:ring-[#25D366]"
                                    />
                                    <span className="font-semibold text-emerald-700 flex items-center gap-1">
                                        <span>🎯 Sertakan Achievement PR → PO</span>
                                    </span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={waWithCategory}
                                        onChange={(e) => setWaWithCategory(e.target.checked)}
                                        className="rounded border-gray-300 text-[#25D366] focus:ring-[#25D366]"
                                    />
                                    <span className="font-semibold text-blue-700">Kategori di Baris</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={waWithProblem}
                                        onChange={(e) => setWaWithProblem(e.target.checked)}
                                        className="rounded border-gray-300 text-[#25D366] focus:ring-[#25D366]"
                                    />
                                    <span className="font-semibold text-gray-500">Problem/Kerusakan</span>
                                </label>
                            </div>

                            {/* Achievement Card Banner */}
                            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/80 rounded-xl p-3 shadow-xs">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex flex-col items-center justify-center shadow-sm shrink-0">
                                            <span className="text-xs font-black leading-none">{modalStats.achievement}%</span>
                                            <span className="text-[8px] uppercase tracking-wider text-emerald-100 font-bold mt-1">PO RATE</span>
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-gray-800 flex items-center gap-2">
                                                <span>Achievement PR yang sudah Diproses PO:</span>
                                                <span className="text-xs font-mono font-extrabold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                                                    {modalStats.achievement}%
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-600 mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                                                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                                                    <b>{modalStats.donePo} PR</b> sudah ada PO
                                                </span>
                                                <span className="text-amber-700 font-semibold flex items-center gap-1">
                                                    <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                                                    <b>{modalStats.pendingPo} PR</b> belum terbit PO
                                                </span>
                                                <span className="text-gray-500">
                                                    (Total: <b>{modalStats.totalPr} PR</b> dari {modalStats.totalOrders} order{modalStats.ordersWithoutPr > 0 ? `, ${modalStats.ordersWithoutPr} belum ada PR` : ''} • <b>{modalStats.totalEquipments} Equipment</b>)
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full sm:w-44 flex flex-col gap-1">
                                        <div className="flex justify-between text-[10px] text-gray-500 font-medium">
                                            <span>Progress PO</span>
                                            <span className="font-bold text-emerald-700">{modalStats.donePo}/{modalStats.totalPr} PR</span>
                                        </div>
                                        <div className="w-full bg-gray-200/80 rounded-full h-2 overflow-hidden">
                                            <div 
                                                className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
                                                style={{ width: `${Math.min(100, Math.max(0, parseFloat(modalStats.achievement)))}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Preview Box */}
                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1.5">
                                        <span>Preview Teks WhatsApp:</span>
                                        <span className="text-[10px] text-gray-400 font-normal font-sans">(Dapat diedit langsung sebelum disalin)</span>
                                    </label>
                                    <span className="text-xs text-gray-500 font-mono font-medium">
                                        {waCustomText.length} karakter
                                    </span>
                                </div>
                                <textarea
                                    value={waCustomText}
                                    onChange={(e) => setWaCustomText(e.target.value)}
                                    rows={11}
                                    className="w-full text-xs font-mono bg-gray-900 text-green-300 p-3.5 rounded-xl border border-gray-700 focus:ring-2 focus:ring-green-400 focus:outline-none resize-none leading-relaxed"
                                    placeholder="Membuat format pesan WhatsApp..."
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
                            <div className="text-xs text-gray-500">
                                {copySuccess && (
                                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                                        Teks tersalin ke clipboard!
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowWaModal(false)}
                                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-200 rounded-lg transition"
                                >
                                    Tutup
                                </button>
                                <button
                                    type="button"
                                    onClick={() => copyToClipboard(waCustomText, `Berhasil menyalin ${waScope === 'all_active' ? allBelumDatang.length : filteredBelumDatang.length} data orderan belum datang ke clipboard!`)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow flex items-center gap-2 transition"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                                    Salin ke Clipboard
                                </button>
                                <button
                                    type="button"
                                    onClick={handleOpenWhatsAppWeb}
                                    className="bg-[#25D366] hover:bg-[#20bd5a] text-white px-4 py-2 rounded-lg text-xs font-bold shadow flex items-center gap-2 transition"
                                    title="Buka WhatsApp Web dan kirim pesan ini"
                                >
                                    <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                                        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.772.82 2.791.82 3.184 0 5.77-2.587 5.77-5.766.001-3.182-2.585-5.769-5.77-5.769zm3.363 8.163c-.144.405-.837.774-1.17.822-.313.044-.633.08-1.503-.277-1.238-.507-2.029-1.764-2.09-1.846-.062-.082-.497-.66-.497-1.258 0-.598.314-.892.425-1.013.11-.12.242-.152.323-.152.08 0 .161.002.23.006.073.003.171-.028.267.202.1.242.341.83.371.891.03.061.05.132.01.212-.04.08-.06.13-.121.202-.06.07-.127.158-.182.212-.06.06-.123.125-.053.245.07.12.311.514.667.831.458.408.845.535.965.595.12.06.191.05.262-.03.07-.08.303-.353.384-.474.08-.12.161-.101.272-.06.111.04.706.333.827.394.12.06.201.09.231.141.03.05.03.525-.114.93zM12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.66 1.444 5.176L2 22l4.981-1.306A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.636 0-3.153-.487-4.423-1.325l-.317-.208-2.96.776.79-2.884-.228-.363A7.95 7.95 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>
                                    </svg>
                                    Buka WhatsApp Web
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Print MOL Selection Modal */}
            {showPrintMolModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-gray-200 overflow-hidden animate-in fade-in zoom-in duration-200">
                        {/* Modal Header */}
                        <div className="bg-[#064e3b] text-white px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg">
                                    🖨️
                                </div>
                                <div>
                                    <h3 className="text-base font-black tracking-tight text-white">Download &amp; Cetak Dokumen MOL</h3>
                                    <p className="text-xs text-green-100 font-medium">Pilih nomor order untuk unduh PDF, Excel, atau cetak dokumen</p>
                                </div>
                            </div>
                            <button 
                                type="button"
                                onClick={() => setShowPrintMolModal(false)}
                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition text-white font-bold cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                    Pilih Nomor Order (MOL)
                                </label>
                                <select
                                    value={selectedPrintMolId || (orders.length > 0 ? orders[0].id : '')}
                                    onChange={(e) => setSelectedPrintMolId(e.target.value)}
                                    className="w-full text-sm font-semibold border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 shadow-xs"
                                >
                                    {orders.map((o) => (
                                        <option key={o.id} value={o.id}>
                                            {o.no_order} — {o.unit?.code_unit || o.lokasi || 'Unit -'} ({o.tanggal}) [{o.status}]
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Selected Order Summary Card */}
                            {(() => {
                                const activePrintOrder = orders.find(o => String(o.id) === String(selectedPrintMolId || (orders.length > 0 ? orders[0].id : '')));
                                if (!activePrintOrder) return null;
                                return (
                                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs space-y-2">
                                        <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                                            <span className="font-mono font-black text-sm text-emerald-800">{activePrintOrder.no_order}</span>
                                            <span className="font-bold text-gray-700 bg-white px-2 py-0.5 rounded border border-gray-200">{activePrintOrder.status}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-gray-600">
                                            <div><span className="font-medium text-gray-400">Unit:</span> <strong className="text-gray-900">{activePrintOrder.unit?.code_unit || activePrintOrder.lokasi || '-'}</strong></div>
                                            <div><span className="font-medium text-gray-400">Tanggal:</span> <strong className="text-gray-900">{activePrintOrder.tanggal || '-'}</strong></div>
                                            <div><span className="font-medium text-gray-400">Komponen:</span> <strong className="text-gray-900">{activePrintOrder.component_name || activePrintOrder.component || '-'}</strong></div>
                                            <div><span className="font-medium text-gray-400">Jumlah Part:</span> <strong className="text-gray-900">{activePrintOrder.parts?.length || 0} Part</strong></div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-gray-50 px-6 py-3.5 border-t border-gray-200 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => setShowPrintMolModal(false)}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-lg text-xs transition cursor-pointer"
                            >
                                Batal
                            </button>
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const targetId = selectedPrintMolId || (orders.length > 0 ? orders[0].id : '');
                                        if (targetId) {
                                            window.open(route('monitoring-orderan.pdf', targetId) + '?download=1', '_blank');
                                        }
                                    }}
                                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                                    title="Unduh file PDF"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                    <span>Unduh PDF</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const targetId = selectedPrintMolId || (orders.length > 0 ? orders[0].id : '');
                                        if (targetId) {
                                            window.location.href = route('monitoring-orderan.excel', targetId);
                                        }
                                    }}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                                    title="Unduh file Excel"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                    <span>Unduh Excel</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const targetId = selectedPrintMolId || (orders.length > 0 ? orders[0].id : '');
                                        if (targetId) {
                                            window.open(route('monitoring-orderan.print', targetId) + '?autoprint=1', '_blank');
                                            setShowPrintMolModal(false);
                                        }
                                    }}
                                    className="px-4 py-2 bg-[#064e3b] hover:bg-[#043327] text-white font-bold rounded-lg text-xs transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                                    title="Cetak langsung ke printer"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                    <span>Print Sekarang</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toastMessage && (
                <div className="fixed bottom-5 right-5 z-50 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-gray-700 animate-in fade-in slide-in-from-bottom-5">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse"></span>
                    <span className="text-sm font-semibold">{toastMessage}</span>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
