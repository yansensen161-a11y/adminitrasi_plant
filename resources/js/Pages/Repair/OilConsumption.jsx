import React, { useEffect, useRef, useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { 
    Droplet, 
    Calendar,
    Download,
    Printer,
    Plus,
    Search,
    RefreshCw,
    Eye,
    Edit3,
    Trash2,
    X,
    CheckCircle2,
    AlertTriangle,
    Upload,
    FileSpreadsheet,
    Gauge,
    Layers,
    Clock,
    FileText,
    User,
    BarChart3,
    PieChart,
    TrendingUp,
    Truck,
    Cpu,
    Activity,
    SlidersHorizontal,
    Table,
    ArrowUpRight,
    Sparkles,
    Tractor,
    Zap,
    Wrench,
    Check
} from 'lucide-react';
import Chart from 'chart.js/auto';

export default function OilConsumption({ 
    tableData = [], 
    pagination = {}, 
    summary = {}, 
    unitTypeDashboards = {},
    allUnitTypes = [],
    standardOilGrades = [],
    perGradeAnalytics = [],
    allGradeStats = [],
    units = [], 
    oilTypes = [], 
    components = [], 
    modelOptions = [], 
    departmentOptions = [], 
    filters = {} 
}) {
    const { manpowerList = [] } = usePage().props;

    // Active Top Tab: 'analytics' (Dark Comparison Dashboard) | 'grade_analytics' | 'data' (Data Table & CRUD)
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const [activeTab, setActiveTab] = useState(urlParams?.get('tab') || 'analytics');

    const handleTabChange = (tabName) => {
        setActiveTab(tabName);
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.set('tab', tabName);
            window.history.replaceState({}, '', url);
        }
    };

    // Selected Unit Type for Dark Dashboard
    const defaultUnitType = (allUnitTypes && allUnitTypes.length > 0) ? allUnitTypes[0] : 'EXCAVATOR';
    const [selectedUnitType, setSelectedUnitType] = useState(defaultUnitType);

    // Selected Oil Grade Filter for Dark Dashboard
    const [selectedOilGrade, setSelectedOilGrade] = useState('Semua');

    // Filter states for Date Range (Interactive on Charts and Table)
    const [chartDateFrom, setChartDateFrom] = useState(filters.dateFrom || filters.minDate || '');
    const [chartDateTo, setChartDateTo] = useState(filters.dateTo || filters.maxDate || '');
    const [isPullingData, setIsPullingData] = useState(false);

    // Filter states for Table Tab
    const [search, setSearch] = useState(filters.search || '');
    const [dateFrom, setDateFrom] = useState(filters.dateFrom || '');
    const [dateTo, setDateTo] = useState(filters.dateTo || '');
    const [codeUnitFilter, setCodeUnitFilter] = useState(filters.codeUnitFilter || '');
    const [modelFilter, setModelFilter] = useState(filters.modelFilter || '');
    const [typeOliFilter, setTypeOliFilter] = useState(filters.typeOliFilter || '');
    const [componentFilter, setComponentFilter] = useState(filters.componentFilter || '');
    const [departmentFilter, setDepartmentFilter] = useState(filters.departmentFilter || '');
    const [statusFilter, setStatusFilter] = useState(filters.statusFilter || '');
    const [hmFromFilter, setHmFromFilter] = useState(filters.hmFromFilter || '');
    const [hmToFilter, setHmToFilter] = useState(filters.hmToFilter || '');

    // Sync dates when filters change from backend
    useEffect(() => {
        if (filters.dateFrom) setChartDateFrom(filters.dateFrom);
        if (filters.dateTo) setChartDateTo(filters.dateTo);
        setDateFrom(filters.dateFrom || '');
        setDateTo(filters.dateTo || '');
    }, [filters.dateFrom, filters.dateTo]);

    // Handle Tarik Data (Apply Date Filter to Dashboard & Charts)
    const handleTarikData = (e) => {
        if (e) e.preventDefault();
        setIsPullingData(true);
        router.get(route('oil-consumption.index'), {
            ...filters,
            dateFrom: chartDateFrom,
            dateTo: chartDateTo,
            tab: activeTab,
        }, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setIsPullingData(false),
        });
    };

    // Handle Reset Date Filter (Show all dates)
    const handleResetDateFilter = () => {
        setChartDateFrom(filters.minDate || '');
        setChartDateTo(filters.maxDate || '');
        setDateFrom('');
        setDateTo('');
        setIsPullingData(true);
        router.get(route('oil-consumption.index'), {
            ...filters,
            dateFrom: '',
            dateTo: '',
            tab: activeTab,
        }, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setIsPullingData(false),
        });
    };

    // Modal States
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
    const [selectedId, setSelectedId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Detail Modal State
    const [viewData, setViewData] = useState(null);

    // Import Modal State
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [isImporting, setIsImporting] = useState(false);

    // Form data state
    const todayStr = new Date().toISOString().split('T')[0];
    const initialFormState = {
        unit_id: '',
        code_unit: '',
        model: '',
        department: 'Mining',
        date: todayStr,
        hm_prev: '',
        hm: '',
        component: 'Engine',
        type_oli: 'SAE 15W-40',
        service_type: 'Schedule',
        pengisian: '',
        remarks: 'Normal top-up berkala',
        pic: 'Admin Plant',
        update_unit_hm: true,
    };
    const [formData, setFormData] = useState(initialFormState);

    // Chart Refs
    const darkComparisonChartRef = useRef(null);
    const allGradeChartRef = useRef(null);
    const gradeDonutRef = useRef(null);
    const chartInstances = useRef({});

    // Filter submit & reset for Table tab
    const handleReset = () => {
        setSearch('');
        setDateFrom('');
        setDateTo('');
        setCodeUnitFilter('');
        setModelFilter('');
        setTypeOliFilter('');
        setComponentFilter('');
        setDepartmentFilter('');
        setStatusFilter('');
        setHmFromFilter('');
        setHmToFilter('');
        router.get(route('oil-consumption.index'));
    };

    const handleFilterSubmit = (e) => {
        if (e) e.preventDefault();
        router.get(route('oil-consumption.index'), {
            search,
            dateFrom,
            dateTo,
            codeUnitFilter,
            modelFilter,
            typeOliFilter,
            componentFilter,
            departmentFilter,
            statusFilter,
            hmFromFilter,
            hmToFilter
        }, { preserveState: true, replace: true });
    };

    // Open Form Modal for Create
    const handleOpenCreateModal = () => {
        setModalMode('create');
        setSelectedId(null);
        setFormData(initialFormState);
        setIsFormModalOpen(true);
    };

    // Open Form Modal for Edit
    const handleOpenEditModal = (row) => {
        setModalMode('edit');
        setSelectedId(row.id);
        setFormData({
            unit_id: row.unit_id || '',
            code_unit: row.code_unit || '',
            model: row.model || '',
            department: row.department || 'Mining',
            date: row.date_raw || todayStr,
            hm_prev: row.hm_prev_raw || 0,
            hm: row.hm_raw || 0,
            component: row.component || 'Engine',
            type_oli: row.type_oli || 'SAE 15W-40',
            service_type: row.service_type || 'Schedule',
            pengisian: row.pengisian_raw || 0,
            remarks: row.remarks || 'Normal',
            pic: row.pic || 'Admin Plant',
            update_unit_hm: false,
        });
        setIsFormModalOpen(true);
    };

    // Handle Unit Selection in Modal
    const handleUnitSelect = (e) => {
        const selectedCode = e.target.value;
        const found = units.find(u => u.code_unit === selectedCode);
        if (found) {
            setFormData(prev => ({
                ...prev,
                code_unit: found.code_unit,
                unit_id: found.id,
                model: found.model,
                department: found.location,
                hm_prev: found.current_hm,
                hm: found.current_hm > 0 ? found.current_hm : '',
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                code_unit: selectedCode,
                unit_id: '',
            }));
        }
    };

    // Live Ratio Calculation in Modal
    const liveCalculation = useMemo(() => {
        const hmPrev = parseFloat(formData.hm_prev || 0);
        const hmAkhir = parseFloat(formData.hm || 0);
        const hmDiff = Math.max(0, hmAkhir - hmPrev);
        const refill = parseFloat(formData.pengisian || 0);
        
        const ratio = hmDiff > 0 ? ((refill / hmDiff) * 100).toFixed(2) : '0.00';
        
        const isHauler = (formData.model || '').toUpperCase().includes('HAULER') ||
                         (formData.code_unit || '').toUpperCase().startsWith('OHT') ||
                         (formData.model || '').toUpperCase().includes('HD');
        
        const batas = isHauler ? 0.60 : 0.50;
        const ratioNum = parseFloat(ratio);
        
        let status = 'Normal';
        let statusColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
        if (ratioNum > batas) {
            status = 'Over Limit';
            statusColor = 'text-red-700 bg-red-50 border-red-200';
        } else if (ratioNum > (batas * 0.8)) {
            status = 'Perlu Monitoring';
            statusColor = 'text-amber-700 bg-amber-50 border-amber-200';
        }

        return { hmDiff, ratio, batas, status, statusColor };
    }, [formData.hm_prev, formData.hm, formData.pengisian, formData.model, formData.code_unit]);

    // Handle Form Submit
    const handleFormSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (modalMode === 'create') {
            router.post(route('oil-consumption.store'), formData, {
                onSuccess: () => {
                    setIsFormModalOpen(false);
                    setIsSubmitting(false);
                },
                onError: () => setIsSubmitting(false),
            });
        } else {
            router.put(route('oil-consumption.update', selectedId), formData, {
                onSuccess: () => {
                    setIsFormModalOpen(false);
                    setIsSubmitting(false);
                },
                onError: () => setIsSubmitting(false),
            });
        }
    };

    // Handle Delete
    const handleDelete = (row) => {
        if (confirm(`Apakah Anda yakin ingin menghapus catatan konsumsi oli unit ${row.code_unit} tanggal ${row.date}?`)) {
            router.delete(route('oil-consumption.destroy', row.id));
        }
    };

    // Handle Import
    const handleImportSubmit = (e) => {
        e.preventDefault();
        if (!importFile) return;

        const data = new FormData();
        data.append('file', importFile);
        setIsImporting(true);

        router.post(route('oil-consumption.import'), data, {
            onSuccess: () => {
                setIsImportModalOpen(false);
                setImportFile(null);
                setIsImporting(false);
            },
            onError: () => setIsImporting(false),
        });
    };

    // =========================================================================
    // DYNAMIC DATA FOR DARK COMPARISON DASHBOARD
    // =========================================================================
    const activeDashboard = useMemo(() => {
        const raw = unitTypeDashboards[selectedUnitType] || {
            unit_type: selectedUnitType,
            total_units: 0,
            active_units: 0,
            total_schedule: 0,
            total_unschedule: 0,
            total_consumption: 0,
            schedule_pct_change: '+12% vs last period',
            unschedule_pct_change: '+5% vs last period',
            consumption_pct_change: '+10% vs last period',
            highest_consumer: { code_unit: '-', total_liters: 0, schedule_liters: 0, unschedule_liters: 0 },
            highest_unscheduled: { code_unit: '-', unschedule_liters: 0, pct_of_total: 0 },
            units: [],
        };

        // If specific oil grade filter is active
        if (selectedOilGrade !== 'Semua') {
            let totalS = 0;
            let totalU = 0;
            const filteredUnits = (raw.units || []).map(u => {
                const gradeInfo = u.by_grade && u.by_grade[selectedOilGrade] 
                    ? u.by_grade[selectedOilGrade] 
                    : { schedule: 0, unschedule: 0, total: 0 };
                
                totalS += gradeInfo.schedule;
                totalU += gradeInfo.unschedule;

                return {
                    code_unit: u.code_unit,
                    model: u.model,
                    schedule_liters: gradeInfo.schedule,
                    unschedule_liters: gradeInfo.unschedule,
                    total_liters: gradeInfo.total,
                };
            });

            const totalC = totalS + totalU;
            const sortedByTotal = [...filteredUnits].sort((a, b) => b.total_liters - a.total_liters);
            const sortedByU = [...filteredUnits].sort((a, b) => b.unschedule_liters - a.unschedule_liters);

            const highestC = sortedByTotal[0] || { code_unit: '-', total_liters: 0, schedule_liters: 0, unschedule_liters: 0 };
            const highestU = sortedByU[0] || { code_unit: '-', unschedule_liters: 0, total_liters: 0 };
            const highestUPct = totalC > 0 ? Math.round((highestU.unschedule_liters / totalC) * 100) : 0;

            return {
                ...raw,
                total_schedule: Math.round(totalS * 10) / 10,
                total_unschedule: Math.round(totalU * 10) / 10,
                total_consumption: Math.round(totalC * 10) / 10,
                highest_consumer: {
                    code_unit: highestC.code_unit,
                    total_liters: highestC.total_liters,
                    schedule_liters: highestC.schedule_liters,
                    unschedule_liters: highestC.unschedule_liters,
                },
                highest_unscheduled: {
                    code_unit: highestU.code_unit,
                    unschedule_liters: highestU.unschedule_liters,
                    pct_of_total: highestUPct,
                },
                units: filteredUnits,
            };
        }

        return raw;
    }, [unitTypeDashboards, selectedUnitType, selectedOilGrade]);

    // Unit Type Icon Helper
    const getUnitTypeIcon = (typeName) => {
        const u = (typeName || '').toUpperCase();
        if (u.includes('EXCAVATOR')) return <Tractor className="w-4 h-4 text-amber-400" />;
        if (u.includes('HAULER') || u.includes('DUMP')) return <Truck className="w-4 h-4 text-blue-400" />;
        if (u.includes('DOZER')) return <Layers className="w-4 h-4 text-purple-400" />;
        if (u.includes('GRADER')) return <SlidersHorizontal className="w-4 h-4 text-emerald-400" />;
        if (u.includes('CRUSHER')) return <Cpu className="w-4 h-4 text-rose-400" />;
        if (u.includes('COMPACTOR')) return <Gauge className="w-4 h-4 text-yellow-400" />;
        if (u.includes('TOWER')) return <Sparkles className="w-4 h-4 text-amber-300" />;
        if (u.includes('SERVICE') || u.includes('FUEL') || u.includes('WATER') || u.includes('PUMP')) return <Droplet className="w-4 h-4 text-cyan-400" />;
        if (u.includes('CRANE') || u.includes('LOWBOY')) return <Wrench className="w-4 h-4 text-indigo-400" />;
        if (u.includes('GENSET') || u.includes('COMPRESSOR') || u.includes('WELDING')) return <Zap className="w-4 h-4 text-orange-400" />;
        return <Activity className="w-4 h-4 text-teal-400" />;
    };

    // Helper function for Component by Grade
    const getComponentForGrade = (gradeName) => {
        const g = (gradeName || '').toUpperCase();
        if (g.includes('15W-40') || g.includes('15W40') || g.includes('50') || g.includes('60')) return 'Engine System';
        if (g.includes('46') || g.includes('V68') || g.includes('68')) return 'Hydraulic System';
        if (g.includes('COOLANT')) return 'Cooling Radiator';
        if (g.includes('GREASE')) return 'Chassis & Greasing';
        if (g.includes('80W-90') || g.includes('85W-140') || g.includes('90')) return 'Differential & Final Drive';
        if (g.includes('ATF') || g.includes('10W') || g.includes('30')) return 'Transmission & Torque Converter';
        return 'General Lubricant';
    };

    // Memoized Totals for All Grade Oil Tab
    const totalAllGradeSchedule = useMemo(() => {
        return Math.round((allGradeStats || []).reduce((acc, g) => acc + (g.schedule_liter || 0), 0) * 10) / 10;
    }, [allGradeStats]);

    const totalAllGradeUnschedule = useMemo(() => {
        return Math.round((allGradeStats || []).reduce((acc, g) => acc + (g.unschedule_liter || 0), 0) * 10) / 10;
    }, [allGradeStats]);

    const totalAllGradeConsumption = useMemo(() => {
        return Math.round((totalAllGradeSchedule + totalAllGradeUnschedule) * 10) / 10;
    }, [totalAllGradeSchedule, totalAllGradeUnschedule]);

    const topConsumedGrade = useMemo(() => {
        const sorted = [...(allGradeStats || [])].sort((a, b) => (b.total_liter || 0) - (a.total_liter || 0));
        return sorted[0] || { grade: '-', total_liter: 0, schedule_liter: 0, unschedule_liter: 0 };
    }, [allGradeStats]);

    const topUnscheduledGrade = useMemo(() => {
        const sorted = [...(allGradeStats || [])].sort((a, b) => (b.unschedule_liter || 0) - (a.unschedule_liter || 0));
        return sorted[0] || { grade: '-', unschedule_liter: 0 };
    }, [allGradeStats]);

    // =========================================================================
    // CHART.JS INITIALIZATION FOR THE DARK DASHBOARD, ALL GRADE CHART & DONUT
    // =========================================================================
    useEffect(() => {
        // Destroy previous chart instances
        Object.keys(chartInstances.current).forEach(key => {
            if (chartInstances.current[key]) {
                chartInstances.current[key].destroy();
            }
        });

        // 1. Dark Comparison Bar Chart: Schedule vs Unschedule per Unit (Tab 1: Dashboard Grafik)
        if (activeTab === 'analytics' && darkComparisonChartRef.current) {
            const chartUnits = activeDashboard.units || [];
            const labels = chartUnits.map(u => u.code_unit);
            const scheduleData = chartUnits.map(u => u.schedule_liters || 0);
            const unscheduleData = chartUnits.map(u => u.unschedule_liters || 0);

            // Custom Plugin to draw the numeric labels on top of each bar (exact like screenshot)
            const valueLabelsPlugin = {
                id: 'valueLabelsPlugin',
                afterDatasetsDraw(chart) {
                    const { ctx } = chart;
                    chart.data.datasets.forEach((dataset, datasetIndex) => {
                        const meta = chart.getDatasetMeta(datasetIndex);
                        meta.data.forEach((bar, index) => {
                            const val = dataset.data[index];
                            if (val !== undefined && val !== null) {
                                ctx.save();
                                ctx.fillStyle = '#f8fafc';
                                ctx.font = 'bold 11px Inter, system-ui, -apple-system, sans-serif';
                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'bottom';
                                const yPos = val > 0 ? bar.y - 4 : bar.y - 2;
                                ctx.fillText(val > 0 ? val.toString() : '0', bar.x, yPos);
                                ctx.restore();
                            }
                        });
                    });
                }
            };

            chartInstances.current.comparison = new Chart(darkComparisonChartRef.current, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Schedule',
                            data: scheduleData,
                            backgroundColor: '#10b981',
                            hoverBackgroundColor: '#059669',
                            borderRadius: { topLeft: 6, topRight: 6 },
                            barPercentage: 0.85,
                            categoryPercentage: 0.70,
                        },
                        {
                            label: 'Unschedule',
                            data: unscheduleData,
                            backgroundColor: '#ef4444',
                            hoverBackgroundColor: '#dc2626',
                            borderRadius: { topLeft: 6, topRight: 6 },
                            barPercentage: 0.85,
                            categoryPercentage: 0.70,
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: {
                        padding: { top: 26, bottom: 8, left: 6, right: 6 }
                    },
                    interaction: {
                        mode: 'index',
                        intersect: false,
                    },
                    scales: {
                        x: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.04)',
                                drawBorder: false,
                            },
                            ticks: {
                                color: '#94a3b8',
                                font: { size: 11, weight: 'bold' },
                                padding: 6,
                            }
                        },
                        y: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.07)',
                                drawBorder: false,
                            },
                            title: {
                                display: true,
                                text: 'LITER (L)',
                                color: '#94a3b8',
                                font: { size: 11, weight: 'bold' }
                            },
                            ticks: {
                                color: '#94a3b8',
                                font: { size: 10 }
                            },
                            beginAtZero: true,
                        }
                    },
                    plugins: {
                        legend: {
                            display: false,
                        },
                        tooltip: {
                            backgroundColor: '#0f172a',
                            titleColor: '#f8fafc',
                            bodyColor: '#e2e8f0',
                            borderColor: '#334155',
                            borderWidth: 1,
                            padding: 10,
                            callbacks: {
                                label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y} L`
                            }
                        }
                    }
                },
                plugins: [valueLabelsPlugin]
            });
        }

        // 2. All Grade Oil Comparison Bar Chart (Tab 2: Grafik all Grade oil)
        if (activeTab === 'grade_analytics' && allGradeChartRef.current) {
            const gradesList = (allGradeStats && allGradeStats.length > 0) ? allGradeStats : perGradeAnalytics;
            const labels = gradesList.map(g => g.grade);
            const scheduleData = gradesList.map(g => g.schedule_liter ?? 0);
            const unscheduleData = gradesList.map(g => g.unschedule_liter ?? 0);

            const allGradeValueLabelsPlugin = {
                id: 'allGradeValueLabelsPlugin',
                afterDatasetsDraw(chart) {
                    const { ctx } = chart;
                    chart.data.datasets.forEach((dataset, datasetIndex) => {
                        const meta = chart.getDatasetMeta(datasetIndex);
                        meta.data.forEach((bar, index) => {
                            const val = dataset.data[index];
                            if (val !== undefined && val !== null) {
                                ctx.save();
                                ctx.fillStyle = '#f8fafc';
                                ctx.font = 'bold 10px Inter, system-ui, -apple-system, sans-serif';
                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'bottom';
                                const yPos = val > 0 ? bar.y - 4 : bar.y - 2;
                                ctx.fillText(val > 0 ? val.toLocaleString('id-ID') : '0', bar.x, yPos);
                                ctx.restore();
                            }
                        });
                    });
                }
            };

            chartInstances.current.allGradeChart = new Chart(allGradeChartRef.current, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Schedule',
                            data: scheduleData,
                            backgroundColor: '#10b981',
                            hoverBackgroundColor: '#059669',
                            borderRadius: { topLeft: 6, topRight: 6 },
                            barPercentage: 0.85,
                            categoryPercentage: 0.70,
                        },
                        {
                            label: 'Unschedule',
                            data: unscheduleData,
                            backgroundColor: '#ef4444',
                            hoverBackgroundColor: '#dc2626',
                            borderRadius: { topLeft: 6, topRight: 6 },
                            barPercentage: 0.85,
                            categoryPercentage: 0.70,
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: {
                        padding: { top: 28, bottom: 8, left: 6, right: 6 }
                    },
                    interaction: {
                        mode: 'index',
                        intersect: false,
                    },
                    scales: {
                        x: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.04)',
                                drawBorder: false,
                            },
                            ticks: {
                                color: '#94a3b8',
                                font: { size: 10, weight: 'bold' },
                                maxRotation: 35,
                                minRotation: 0,
                                padding: 6,
                            }
                        },
                        y: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.07)',
                                drawBorder: false,
                            },
                            title: {
                                display: true,
                                text: 'LITER (L)',
                                color: '#94a3b8',
                                font: { size: 11, weight: 'bold' }
                            },
                            ticks: {
                                color: '#94a3b8',
                                font: { size: 10 }
                            },
                            beginAtZero: true,
                        }
                    },
                    plugins: {
                        legend: {
                            display: false,
                        },
                        tooltip: {
                            backgroundColor: '#0f172a',
                            titleColor: '#f8fafc',
                            bodyColor: '#e2e8f0',
                            borderColor: '#334155',
                            borderWidth: 1,
                            padding: 10,
                            callbacks: {
                                label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString('id-ID')} L`
                            }
                        }
                    }
                },
                plugins: [allGradeValueLabelsPlugin]
            });
        }

        // 3. Donut Chart: Proporsi Grade Oli Seluruh Armada
        if (gradeDonutRef.current) {
            const labels = (perGradeAnalytics || []).map(g => g.grade);
            const values = (perGradeAnalytics || []).map(g => g.total_liter);
            const colors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b', '#14b8a6', '#f97316', '#6366f1'];

            chartInstances.current.gradeDonut = new Chart(gradeDonutRef.current, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: values,
                        backgroundColor: colors.slice(0, labels.length),
                        borderWidth: 2,
                        borderColor: '#ffffff',
                        cutout: '64%'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'right', labels: { boxWidth: 12, font: { size: 11, weight: '600' } } }
                    }
                }
            });
        }

        return () => {
            Object.keys(chartInstances.current).forEach(key => {
                if (chartInstances.current[key]) {
                    chartInstances.current[key].destroy();
                }
            });
        };
    }, [activeTab, selectedUnitType, selectedOilGrade, activeDashboard, perGradeAnalytics, allGradeStats]);

    return (
        <AuthenticatedLayout
            header={
                <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-800 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-700/20">
                            <Droplet size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">
                                OIL CONSUMPTION MONITORING
                            </h1>
                            <div className="text-sm text-gray-500 font-semibold mt-0.5 flex items-center gap-2">
                                <span>Component &amp; Condition Monitoring</span>
                                <span className="text-gray-300">&bull;</span>
                                <span className="text-emerald-700 font-bold">Pencatatan &amp; Analisis Konsumsi Pelumas Alat Berat</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2.5">
                        {/* Tombol Input Data */}
                        <button 
                            type="button"
                            onClick={handleOpenCreateModal}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-black rounded-xl shadow-md shadow-emerald-600/30 transition-all transform hover:-translate-y-0.5"
                        >
                            <Plus size={18} strokeWidth={3} />
                            <span>Input Data</span>
                        </button>

                        {/* Tombol Import Excel */}
                        <button 
                            type="button"
                            onClick={() => setIsImportModalOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 text-sm font-bold rounded-xl shadow-sm transition-all"
                        >
                            <Upload size={16} className="text-emerald-600" />
                            <span>Import Excel</span>
                        </button>

                        {/* Tombol Export Excel */}
                        <a 
                            href={route('oil-consumption.export', { 
                                dateFrom: chartDateFrom || filters.dateFrom || '', 
                                dateTo: chartDateTo || filters.dateTo || '' 
                            })}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 text-sm font-bold rounded-xl shadow-sm transition-all"
                        >
                            <Download size={16} className="text-blue-600" />
                            <span>Export Excel</span>
                        </a>

                        {/* Tombol Print */}
                        <button 
                            type="button"
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 text-sm font-bold rounded-xl shadow-sm transition-all"
                        >
                            <Printer size={16} className="text-gray-600" />
                            <span>Print</span>
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Oil Consumption Monitoring" />

            {/* FULL SCREEN WIDTH CONTAINER */}
            <div className="w-full px-4 sm:px-6 lg:px-8 space-y-6 pb-16">
                
                {/* TOP NAVIGATION TABS */}
                <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-1.5 flex items-center justify-between gap-2 overflow-x-auto">
                    <div className="flex items-center gap-1.5 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={() => handleTabChange('analytics')}
                            className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-black text-sm transition-all ${
                                activeTab === 'analytics'
                                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/30'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                        >
                            <BarChart3 size={18} className={activeTab === 'analytics' ? 'text-amber-400' : ''} />
                            <span>Dashboard Grafik</span>
                            {activeTab === 'analytics' && (
                                <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                </span>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => handleTabChange('grade_analytics')}
                            className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-black text-sm transition-all ${
                                activeTab === 'grade_analytics'
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                        >
                            <Droplet size={18} className={activeTab === 'grade_analytics' ? 'text-cyan-300' : ''} />
                            <span>Grafik all Grade oil</span>
                            {activeTab === 'grade_analytics' && (
                                <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                                </span>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => handleTabChange('data')}
                            className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-black text-sm transition-all ${
                                activeTab === 'data'
                                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                        >
                            <Table size={18} />
                            <span>Data Tabel &amp; Monitoring</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                activeTab === 'data' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                            }`}>
                                {summary.total_pengisian || 0}
                            </span>
                        </button>
                    </div>

                    <div className="hidden lg:flex items-center gap-2 pr-3 text-xs font-bold text-gray-500">
                        <Activity size={14} className="text-emerald-600" />
                        <span>Live Database Refreshed</span>
                    </div>
                </div>

                {/* ========================================================================= */}
                {/* TAB 1: ALL GRAFIK & ANALITIK PER TIPE UNIT (SCHEDULE VS UNSCHEDULE)      */}
                {/* ========================================================================= */}
                {activeTab === 'analytics' && (
                    <div className="space-y-6">

                        {/* 1. TIPE UNIT SELECTOR PILL BAR */}
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-lg">
                            <div className="flex items-center justify-between px-2 pb-2.5 border-b border-slate-800 mb-2.5">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                                        <Layers size={14} />
                                        PILIH TIPE UNIT ALAT BERAT ({allUnitTypes.length} KATEGORI):
                                    </span>
                                </div>
                                <div className="text-xs text-slate-400 font-semibold">
                                    Aktif: <span className="text-white font-bold">{selectedUnitType}</span> ({activeDashboard.total_units} unit terdaftar)
                                </div>
                            </div>

                            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-700">
                                {allUnitTypes.map(uType => {
                                    const isSelected = selectedUnitType === uType;
                                    const dInfo = unitTypeDashboards[uType];
                                    const count = dInfo ? dInfo.total_units : 0;

                                    return (
                                        <button
                                            key={uType}
                                            type="button"
                                            onClick={() => setSelectedUnitType(uType)}
                                            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                                                isSelected
                                                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/20 scale-[1.02]'
                                                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60'
                                            }`}
                                        >
                                            {getUnitTypeIcon(uType)}
                                            <span>{uType}</span>
                                            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                                                isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-700 text-slate-300'
                                            }`}>
                                                {count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 2. GRADE OIL SELECTOR BAR (14 SAE GRADES) */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                <div className="flex items-center gap-2">
                                    <Droplet size={18} className="text-emerald-600" />
                                    <span className="text-sm font-black text-gray-900 uppercase tracking-tight">
                                        Filter Grade Pelumas &amp; Cairan:
                                    </span>
                                </div>
                                <span className="text-xs text-gray-500 font-semibold">
                                    Menampilkan data: <strong className="text-emerald-700 font-black">{selectedOilGrade === 'Semua' ? 'Semua Grade Pelumas' : selectedOilGrade}</strong>
                                </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedOilGrade('Semua')}
                                    className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all ${
                                        selectedOilGrade === 'Semua'
                                            ? 'bg-emerald-600 text-white shadow-sm'
                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                    }`}
                                >
                                    Semua Grade Pelumas
                                </button>

                                {standardOilGrades.map(grade => {
                                    const isSel = selectedOilGrade === grade;
                                    return (
                                        <button
                                            key={grade}
                                            type="button"
                                            onClick={() => setSelectedOilGrade(grade)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                                isSel
                                                    ? 'bg-emerald-600 text-white shadow-sm font-black'
                                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                            }`}
                                        >
                                            {grade}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 3. THE HIGH-TECH DARK COMPARISON DASHBOARD (EXACT SCREENSHOT REPLICA) */}
                        <div className="relative rounded-3xl bg-gradient-to-br from-[#0B132B] via-[#090F22] to-[#050914] border border-cyan-900/40 shadow-2xl p-6 sm:p-8 text-white overflow-hidden">
                            
                            {/* Subtle Radial Glow & Background Watermark Silhouette */}
                            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
                            <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>
                            
                            {/* Machinery Silhouette Watermark on the Right */}
                            <div className="absolute right-6 bottom-16 opacity-10 pointer-events-none hidden md:block">
                                <svg width="340" height="200" viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M40 180H340V210H40V180Z" fill="currentColor"/>
                                    <path d="M70 140H220V180H70V140Z" fill="currentColor"/>
                                    <path d="M110 90H180V140H110V90Z" fill="currentColor"/>
                                    <path d="M180 120L310 40L330 60L230 140H180V120Z" fill="currentColor"/>
                                    <path d="M310 40L360 90L340 100L300 60L310 40Z" fill="currentColor"/>
                                    <circle cx="90" cy="195" r="18" fill="#000" stroke="currentColor" strokeWidth="4"/>
                                    <circle cx="160" cy="195" r="18" fill="#000" stroke="currentColor" strokeWidth="4"/>
                                    <circle cx="230" cy="195" r="18" fill="#000" stroke="currentColor" strokeWidth="4"/>
                                    <circle cx="300" cy="195" r="18" fill="#000" stroke="currentColor" strokeWidth="4"/>
                                </svg>
                            </div>

                            {/* TOP HEADER SECTION */}
                            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
                                
                                {/* Left Title & Icon & Legend */}
                                <div className="flex items-start gap-4">
                                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-md shadow-amber-500/10 flex-shrink-0">
                                        <Tractor size={32} strokeWidth={2.2} />
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
                                                OIL CONSUMPTION - <span className="text-amber-400">{selectedUnitType}</span>
                                            </h2>
                                            
                                            {/* Interactive Date Range Filter ("Tarik Data") */}
                                            <form onSubmit={handleTarikData} className="inline-flex flex-wrap items-center gap-1.5 bg-slate-900/95 border border-slate-700/90 p-1.5 rounded-xl shadow-lg">
                                                <div className="flex items-center gap-1 pl-1 text-xs font-bold text-amber-400">
                                                    <Calendar size={14} className="flex-shrink-0" />
                                                    <span className="hidden sm:inline text-slate-300 text-[11px] font-bold">Periode:</span>
                                                </div>
                                                <input 
                                                    type="date"
                                                    value={chartDateFrom}
                                                    onChange={(e) => setChartDateFrom(e.target.value)}
                                                    className="bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-lg px-2 py-1 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none [color-scheme:dark] transition-all cursor-pointer"
                                                    title="Pilih tanggal awal tarik data"
                                                />
                                                <span className="text-slate-400 text-xs font-bold">s/d</span>
                                                <input 
                                                    type="date"
                                                    value={chartDateTo}
                                                    onChange={(e) => setChartDateTo(e.target.value)}
                                                    className="bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-lg px-2 py-1 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none [color-scheme:dark] transition-all cursor-pointer"
                                                    title="Pilih tanggal akhir tarik data"
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={isPullingData}
                                                    className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-slate-950 font-black text-xs rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
                                                >
                                                    <RefreshCw size={12} className={isPullingData ? 'animate-spin' : ''} />
                                                    <span>Tarik Data</span>
                                                </button>
                                                {(filters.dateFrom || filters.dateTo) && (
                                                    <button
                                                        type="button"
                                                        onClick={handleResetDateFilter}
                                                        title="Reset Filter Tanggal (Tampilkan Semua)"
                                                        className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg text-xs font-bold transition-all cursor-pointer"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                )}
                                            </form>

                                            {/* Badge Display of Active Period */}
                                            {filters.formattedRange && (
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/90 border border-slate-700 text-xs font-bold text-slate-300">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                                    <span>{filters.formattedRange}</span>
                                                </div>
                                            )}
                                        </div>

                                        <p className="text-sm font-semibold text-slate-400">
                                            Comparison Schedule vs Unscheduled | Per Unit {selectedOilGrade !== 'Semua' ? `[Filter: ${selectedOilGrade}]` : ''}
                                        </p>

                                        {/* Legend (Schedule vs Unschedule) */}
                                        <div className="flex items-center gap-5 pt-1">
                                            <div className="flex items-center gap-2">
                                                <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
                                                <span className="text-xs font-bold text-slate-200">Schedule</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50"></span>
                                                <span className="text-xs font-bold text-slate-200">Unschedule</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: 3 KPI Cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    
                                    {/* 1. TOTAL SCHEDULE */}
                                    <div className="bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-2xl p-4 shadow-lg flex items-center gap-3 min-w-[170px]">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                                            <Droplet size={20} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">TOTAL SCHEDULE</div>
                                            <div className="text-2xl font-black text-white font-mono mt-0.5">
                                                {activeDashboard.total_schedule} <span className="text-sm font-bold text-slate-400">L</span>
                                            </div>
                                            <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                                                <span>▲</span>
                                                <span>+12% vs last period</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2. TOTAL UNSCHEDULE */}
                                    <div className="bg-gradient-to-br from-rose-950/40 to-slate-900 border border-rose-500/30 rounded-2xl p-4 shadow-lg flex items-center gap-3 min-w-[170px]">
                                        <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0">
                                            <Droplet size={20} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">TOTAL UNSCHEDULE</div>
                                            <div className="text-2xl font-black text-white font-mono mt-0.5">
                                                {activeDashboard.total_unschedule} <span className="text-sm font-bold text-slate-400">L</span>
                                            </div>
                                            <div className="text-[11px] font-bold text-rose-400 flex items-center gap-1 mt-0.5">
                                                <span>▲</span>
                                                <span>+5% vs last period</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 3. TOTAL CONSUMPTION */}
                                    <div className="bg-gradient-to-br from-blue-950/40 to-slate-900 border border-blue-500/30 rounded-2xl p-4 shadow-lg flex items-center gap-3 min-w-[170px]">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 font-black text-lg">
                                            &Sigma;
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">TOTAL CONSUMPTION</div>
                                            <div className="text-2xl font-black text-white font-mono mt-0.5">
                                                {activeDashboard.total_consumption} <span className="text-sm font-bold text-slate-400">L</span>
                                            </div>
                                            <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                                                <span>▲</span>
                                                <span>+10% vs last period</span>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            {/* MAIN CANVAS: HIGH RESOLUTION SCHEDULE VS UNSCHEDULE PER UNIT */}
                            <div className="relative z-10 my-6">
                                <div className="h-[360px] sm:h-[400px] w-full">
                                    <canvas ref={darkComparisonChartRef}></canvas>
                                </div>
                                <div className="text-center text-[11px] font-black tracking-widest text-slate-500 uppercase mt-2">
                                    UNIT CODE
                                </div>
                            </div>

                            {/* BOTTOM METRIC STRIP */}
                            <div className="relative z-10 pt-4 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex flex-wrap items-center gap-4">
                                    
                                    {/* Highest Consumer */}
                                    <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                                            <BarChart3 size={16} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase">UNIT WITH HIGHEST CONSUMPTION</div>
                                            <div className="text-sm font-black text-white flex items-center gap-2">
                                                <span className="text-amber-400 font-mono text-base">{activeDashboard.highest_consumer?.code_unit || '-'}</span>
                                                <span>{activeDashboard.highest_consumer?.total_liters || 0} L</span>
                                                <span className="text-xs font-normal text-slate-400">
                                                    (Schedule {activeDashboard.highest_consumer?.schedule_liters || 0} L | Unschedule {activeDashboard.highest_consumer?.unschedule_liters || 0} L)
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Highest Unscheduled */}
                                    <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                                            <Droplet size={16} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase">HIGHEST UNSCHEDULED</div>
                                            <div className="text-sm font-black text-white flex items-center gap-2">
                                                <span className="text-amber-400 font-mono text-base">{activeDashboard.highest_unscheduled?.code_unit || '-'}</span>
                                                <span>{activeDashboard.highest_unscheduled?.unschedule_liters || 0} L</span>
                                                <span className="text-xs font-normal text-slate-400">
                                                    {activeDashboard.highest_unscheduled?.pct_of_total || 0}% of total
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Total Units */}
                                    <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                                            <Gauge size={16} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase">TOTAL UNIT</div>
                                            <div className="text-base font-black text-amber-400">
                                                {activeDashboard.total_units} Unit
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                {/* Tagline */}
                                <div className="text-right text-xs font-medium italic text-slate-500 tracking-wider">
                                    Keep The Plant Running
                                </div>
                            </div>

                        </div>

                        {/* 4. CROSS-TABULATION MATRIX TABLE (Per Grade Oil & Per Tipe Unit) */}
                        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                                        <FileSpreadsheet size={20} className="text-emerald-600" />
                                        <span>Rincian Matriks Konsumsi Pelumas: {selectedUnitType}</span>
                                    </h3>
                                    <p className="text-xs text-gray-500 font-semibold mt-0.5">
                                        Breakdown volume pemakaian pelumas terjadwal (Schedule) dan tak terjadwal (Unschedule) per unit
                                    </p>
                                </div>
                            </div>

                            <div className="overflow-x-auto border border-gray-200 rounded-xl">
                                <table className="w-full text-left text-sm border-collapse">
                                    <thead className="bg-gray-50 border-b border-gray-200 text-xs font-black text-gray-600 uppercase tracking-wider">
                                        <tr>
                                            <th className="py-3.5 px-4">No</th>
                                            <th className="py-3.5 px-4">Kode Unit</th>
                                            <th className="py-3.5 px-4">Model / Equipment</th>
                                            <th className="py-3.5 px-4 text-right">Schedule (L)</th>
                                            <th className="py-3.5 px-4 text-right">Unschedule (L)</th>
                                            <th className="py-3.5 px-4 text-right font-black">Total Liter</th>
                                            <th className="py-3.5 px-4 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {(activeDashboard.units || []).map((u, idx) => (
                                            <tr key={u.code_unit} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="py-3 px-4 text-gray-500 font-semibold text-xs">{idx + 1}</td>
                                                <td className="py-3 px-4 font-black text-gray-900 font-mono">{u.code_unit}</td>
                                                <td className="py-3 px-4 text-gray-700 font-semibold text-xs">{u.model}</td>
                                                <td className="py-3 px-4 text-right font-bold text-emerald-700 font-mono">{u.schedule_liters} L</td>
                                                <td className="py-3 px-4 text-right font-bold text-rose-700 font-mono">{u.unschedule_liters} L</td>
                                                <td className="py-3 px-4 text-right font-black text-gray-900 font-mono text-base">{u.total_liters} L</td>
                                                <td className="py-3 px-4 text-center">
                                                    {u.total_liters > 0 ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                                                            <Check size={12} /> Aktif
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
                                                            0 Liter
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-slate-100 font-black text-gray-900 border-t-2 border-gray-300">
                                        <tr>
                                            <td colSpan={3} className="py-3.5 px-4 uppercase text-xs">Total Armada {selectedUnitType}</td>
                                            <td className="py-3.5 px-4 text-right font-mono text-emerald-800 text-base">{activeDashboard.total_schedule} L</td>
                                            <td className="py-3.5 px-4 text-right font-mono text-rose-800 text-base">{activeDashboard.total_unschedule} L</td>
                                            <td className="py-3.5 px-4 text-right font-mono text-blue-900 text-lg">{activeDashboard.total_consumption} L</td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                    </div>
                )}

                {/* ========================================================================= */}
                {/* TAB 2: GRAFIK ALL GRADE OIL (KONSUMSI SELURUH GRADE PELUMAS)             */}
                {/* ========================================================================= */}
                {activeTab === 'grade_analytics' && (
                    <div className="space-y-6">

                        {/* 1. THE HIGH-TECH DARK COMPARISON DASHBOARD FOR ALL GRADE OIL */}
                        <div className="relative rounded-3xl bg-gradient-to-br from-[#0B132B] via-[#090F22] to-[#050914] border border-cyan-900/40 shadow-2xl p-6 sm:p-8 text-white overflow-hidden">
                            
                            {/* Subtle Radial Glows */}
                            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
                            <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

                            {/* TOP HEADER SECTION */}
                            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
                                
                                {/* Left Title & Legend */}
                                <div className="flex items-start gap-4">
                                    <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 shadow-md shadow-blue-500/10 flex-shrink-0">
                                        <Droplet size={32} strokeWidth={2.2} />
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
                                                OIL CONSUMPTION - <span className="text-blue-400">ALL GRADE OIL</span>
                                            </h2>
                                            
                                            {/* Interactive Date Range Filter ("Tarik Data") */}
                                            <form onSubmit={handleTarikData} className="inline-flex flex-wrap items-center gap-1.5 bg-slate-900/95 border border-slate-700/90 p-1.5 rounded-xl shadow-lg">
                                                <div className="flex items-center gap-1 pl-1 text-xs font-bold text-cyan-400">
                                                    <Calendar size={14} className="flex-shrink-0" />
                                                    <span className="hidden sm:inline text-slate-300 text-[11px] font-bold">Periode:</span>
                                                </div>
                                                <input 
                                                    type="date"
                                                    value={chartDateFrom}
                                                    onChange={(e) => setChartDateFrom(e.target.value)}
                                                    className="bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-lg px-2 py-1 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none [color-scheme:dark] transition-all cursor-pointer"
                                                    title="Pilih tanggal awal tarik data"
                                                />
                                                <span className="text-slate-400 text-xs font-bold">s/d</span>
                                                <input 
                                                    type="date"
                                                    value={chartDateTo}
                                                    onChange={(e) => setChartDateTo(e.target.value)}
                                                    className="bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-lg px-2 py-1 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none [color-scheme:dark] transition-all cursor-pointer"
                                                    title="Pilih tanggal akhir tarik data"
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={isPullingData}
                                                    className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 active:scale-95 text-white font-black text-xs rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
                                                >
                                                    <RefreshCw size={12} className={isPullingData ? 'animate-spin' : ''} />
                                                    <span>Tarik Data</span>
                                                </button>
                                                {(filters.dateFrom || filters.dateTo) && (
                                                    <button
                                                        type="button"
                                                        onClick={handleResetDateFilter}
                                                        title="Reset Filter Tanggal (Tampilkan Semua)"
                                                        className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg text-xs font-bold transition-all cursor-pointer"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                )}
                                            </form>

                                            {/* Badge Display of Active Period */}
                                            {filters.formattedRange && (
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/90 border border-slate-700 text-xs font-bold text-slate-300">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                                                    <span>{filters.formattedRange}</span>
                                                </div>
                                            )}
                                        </div>

                                        <p className="text-sm font-semibold text-slate-400">
                                            Comparison Schedule vs Unscheduled | Seluruh 13 Grade Pelumas &amp; Cairan Standar Matriks
                                        </p>

                                        {/* Legend */}
                                        <div className="flex items-center gap-5 pt-1">
                                            <div className="flex items-center gap-2">
                                                <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
                                                <span className="text-xs font-bold text-slate-200">Schedule</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50"></span>
                                                <span className="text-xs font-bold text-slate-200">Unschedule</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: 3 KPI Cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    
                                    {/* 1. TOTAL SCHEDULE */}
                                    <div className="bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-2xl p-4 shadow-lg flex items-center gap-3 min-w-[170px]">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                                            <Droplet size={20} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">TOTAL SCHEDULE</div>
                                            <div className="text-2xl font-black text-white font-mono mt-0.5">
                                                {totalAllGradeSchedule.toLocaleString('id-ID')} <span className="text-sm font-bold text-slate-400">L</span>
                                            </div>
                                            <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                                                <span>Terjadwal</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2. TOTAL UNSCHEDULE */}
                                    <div className="bg-gradient-to-br from-rose-950/40 to-slate-900 border border-rose-500/30 rounded-2xl p-4 shadow-lg flex items-center gap-3 min-w-[170px]">
                                        <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0">
                                            <Droplet size={20} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">TOTAL UNSCHEDULE</div>
                                            <div className="text-2xl font-black text-white font-mono mt-0.5">
                                                {totalAllGradeUnschedule.toLocaleString('id-ID')} <span className="text-sm font-bold text-slate-400">L</span>
                                            </div>
                                            <div className="text-[11px] font-bold text-rose-400 flex items-center gap-1 mt-0.5">
                                                <span>Tak Terjadwal</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 3. TOTAL ALL CONSUMPTION */}
                                    <div className="bg-gradient-to-br from-blue-950/40 to-slate-900 border border-blue-500/30 rounded-2xl p-4 shadow-lg flex items-center gap-3 min-w-[170px]">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 font-black text-lg">
                                            &Sigma;
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">TOTAL KONSUMSI</div>
                                            <div className="text-2xl font-black text-white font-mono mt-0.5">
                                                {totalAllGradeConsumption.toLocaleString('id-ID')} <span className="text-sm font-bold text-slate-400">L</span>
                                            </div>
                                            <div className="text-[11px] font-bold text-blue-400 flex items-center gap-1 mt-0.5">
                                                <span>Seluruh Pelumas</span>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            {/* MAIN CANVAS: COMPARISON SCHEDULE VS UNSCHEDULE ACROSS ALL GRADES */}
                            <div className="relative z-10 my-6">
                                <div className="h-[380px] sm:h-[420px] w-full">
                                    <canvas ref={allGradeChartRef}></canvas>
                                </div>
                                <div className="text-center text-[11px] font-black tracking-widest text-slate-500 uppercase mt-2">
                                    GRADE PELUMAS &amp; CAIRAN (STANDAR MATRIKS MINING)
                                </div>
                            </div>

                            {/* BOTTOM METRIC STRIP */}
                            <div className="relative z-10 pt-4 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex flex-wrap items-center gap-4">
                                    
                                    {/* Highest Consumed Grade */}
                                    <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                                            <BarChart3 size={16} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase">GRADE KONSUMSI TERTINGGI</div>
                                            <div className="text-sm font-black text-white flex items-center gap-2">
                                                <span className="text-blue-400 font-mono text-base">{topConsumedGrade.grade || '-'}</span>
                                                <span>{(topConsumedGrade.total_liter || 0).toLocaleString('id-ID')} L</span>
                                                <span className="text-xs font-normal text-slate-400">
                                                    (Schedule {(topConsumedGrade.schedule_liter || 0).toLocaleString('id-ID')} L | Unschedule {(topConsumedGrade.unschedule_liter || 0).toLocaleString('id-ID')} L)
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Highest Unscheduled Grade */}
                                    <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                                            <Droplet size={16} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase">HIGHEST UNSCHEDULED GRADE</div>
                                            <div className="text-sm font-black text-white flex items-center gap-2">
                                                <span className="text-rose-400 font-mono text-base">{topUnscheduledGrade.grade || '-'}</span>
                                                <span>{(topUnscheduledGrade.unschedule_liter || 0).toLocaleString('id-ID')} L</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Active Grades Count */}
                                    <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                                            <Gauge size={16} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase">GRADE DIGUNAKAN</div>
                                            <div className="text-base font-black text-emerald-400">
                                                {(allGradeStats || []).filter(g => (g.total_liter || 0) > 0).length} / {(allGradeStats || []).length} Grade Aktif
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                {/* Tagline */}
                                <div className="text-right text-xs font-medium italic text-slate-500 tracking-wider">
                                    Keep The Plant Running
                                </div>
                            </div>

                        </div>

                        {/* 2. GRID CARDS: RINCIAN PER GRADE PELUMAS */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                                        <Layers size={18} className="text-blue-600" />
                                        <span>Rincian Seluruh Grade Pelumas (13 Kategori Standar)</span>
                                    </h3>
                                    <p className="text-xs text-gray-500 font-semibold mt-0.5">
                                        Profil pemakaian per pelumas mencakup pembagian volume Schedule vs Unscheduled serta sasaran komponen alat berat
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {(allGradeStats || []).map((gradeItem, idx) => {
                                    const totalL = gradeItem.total_liter || 0;
                                    const schL = gradeItem.schedule_liter || 0;
                                    const unsL = gradeItem.unschedule_liter || 0;
                                    const pctOfAll = totalAllGradeConsumption > 0 ? ((totalL / totalAllGradeConsumption) * 100).toFixed(1) : 0;
                                    const schPct = totalL > 0 ? Math.round((schL / totalL) * 100) : 0;
                                    const unsPct = totalL > 0 ? Math.round((unsL / totalL) * 100) : 0;

                                    return (
                                        <div key={gradeItem.grade || idx} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                                            <div>
                                                <div className="flex items-start justify-between gap-2 mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                                                            #{idx + 1}
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-black text-gray-900 leading-tight">
                                                                {gradeItem.grade}
                                                            </h4>
                                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">
                                                                {getComponentForGrade(gradeItem.grade)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                                                        totalL > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-500'
                                                    }`}>
                                                        {totalL > 0 ? `${pctOfAll}% Share` : '0 L'}
                                                    </span>
                                                </div>

                                                <div className="space-y-1 mb-4">
                                                    <div className="text-2xl font-black text-gray-900 font-mono">
                                                        {totalL.toLocaleString('id-ID')} <span className="text-xs font-bold text-gray-500">Liter</span>
                                                    </div>
                                                    <div className="text-xs text-gray-500 font-semibold">
                                                        {gradeItem.record_count || 0}x Pengisian &bull; Rata-rata: {gradeItem.avg_ratio || 0} L/100 HM
                                                    </div>
                                                </div>

                                                {/* Progress bar Schedule vs Unschedule */}
                                                <div className="space-y-1.5 mb-3">
                                                    <div className="w-full h-2 rounded-full bg-gray-100 flex overflow-hidden">
                                                        <div style={{ width: `${schPct}%` }} className="bg-emerald-500 h-full" title={`Schedule: ${schL} L`}></div>
                                                        <div style={{ width: `${unsPct}%` }} className="bg-rose-500 h-full" title={`Unschedule: ${unsL} L`}></div>
                                                    </div>
                                                    <div className="flex items-center justify-between text-[11px] font-bold">
                                                        <span className="text-emerald-700">SCH: {schL} L ({schPct}%)</span>
                                                        <span className="text-rose-700">UNS: {unsL} L ({unsPct}%)</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Unit Types Breakdown (Tags) */}
                                            {gradeItem.unit_types && Object.keys(gradeItem.unit_types).length > 0 && (
                                                <div className="pt-3 border-t border-gray-100">
                                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                                                        Penggunaan Armada:
                                                    </div>
                                                    <div className="flex flex-wrap gap-1">
                                                        {Object.entries(gradeItem.unit_types).slice(0, 3).map(([uType, vol]) => (
                                                            <span key={uType} className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                                                                {uType}: {vol} L
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 3. TABEL RINGKASAN MATRIKS SELURUH GRADE PELUMAS */}
                        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                                        <FileSpreadsheet size={20} className="text-blue-600" />
                                        <span>Tabel Rekapitulasi Seluruh Grade Pelumas &amp; Cairan</span>
                                    </h3>
                                    <p className="text-xs text-gray-500 font-semibold mt-0.5">
                                        Ringkasan total liter, pemisahan Schedule vs Unscheduled, serta porsi konsumsi setiap grade
                                    </p>
                                </div>
                            </div>

                            <div className="overflow-x-auto border border-gray-200 rounded-xl">
                                <table className="w-full text-left text-sm border-collapse">
                                    <thead className="bg-gray-50 border-b border-gray-200 text-xs font-black text-gray-600 uppercase tracking-wider">
                                        <tr>
                                            <th className="py-3.5 px-4">No</th>
                                            <th className="py-3.5 px-4">Grade Pelumas / Cairan</th>
                                            <th className="py-3.5 px-4">Komponen Sasaran</th>
                                            <th className="py-3.5 px-4 text-center">Frekuensi Refill</th>
                                            <th className="py-3.5 px-4 text-right">Schedule (L)</th>
                                            <th className="py-3.5 px-4 text-right">Unschedule (L)</th>
                                            <th className="py-3.5 px-4 text-right font-black">Total Liter</th>
                                            <th className="py-3.5 px-4 text-center">Porsi (%)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {(allGradeStats || []).map((gItem, idx) => {
                                            const totL = gItem.total_liter || 0;
                                            const schL = gItem.schedule_liter || 0;
                                            const unsL = gItem.unschedule_liter || 0;
                                            const pctShare = totalAllGradeConsumption > 0 ? ((totL / totalAllGradeConsumption) * 100).toFixed(1) : 0;

                                            return (
                                                <tr key={gItem.grade || idx} className="hover:bg-slate-50/80 transition-colors">
                                                    <td className="py-3 px-4 text-gray-500 font-semibold text-xs">{idx + 1}</td>
                                                    <td className="py-3 px-4 font-black text-gray-900">
                                                        <div className="flex items-center gap-2">
                                                            <Droplet size={14} className="text-blue-500" />
                                                            <span>{gItem.grade}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-gray-600 font-medium text-xs">
                                                        {getComponentForGrade(gItem.grade)}
                                                    </td>
                                                    <td className="py-3 px-4 text-center font-bold text-gray-700">
                                                        {gItem.record_count || 0}x
                                                    </td>
                                                    <td className="py-3 px-4 text-right font-bold text-emerald-700 font-mono">
                                                        {schL.toLocaleString('id-ID')} L
                                                    </td>
                                                    <td className="py-3 px-4 text-right font-bold text-rose-700 font-mono">
                                                        {unsL.toLocaleString('id-ID')} L
                                                    </td>
                                                    <td className="py-3 px-4 text-right font-black text-gray-900 font-mono text-base">
                                                        {totL.toLocaleString('id-ID')} L
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        {totL > 0 ? (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                                                                {pctShare}%
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400 text-xs">-</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                    <tfoot className="bg-slate-100 font-black text-gray-900 border-t-2 border-gray-300">
                                        <tr>
                                            <td colSpan={3} className="py-3.5 px-4 uppercase text-xs">TOTAL KONSUMSI SELURUH GRADE</td>
                                            <td className="py-3.5 px-4 text-center text-xs">{(allGradeStats || []).reduce((acc, g) => acc + (g.record_count || 0), 0)}x Refill</td>
                                            <td className="py-3.5 px-4 text-right font-mono text-emerald-800 text-base">{totalAllGradeSchedule.toLocaleString('id-ID')} L</td>
                                            <td className="py-3.5 px-4 text-right font-mono text-rose-800 text-base">{totalAllGradeUnschedule.toLocaleString('id-ID')} L</td>
                                            <td className="py-3.5 px-4 text-right font-mono text-blue-900 text-lg">{totalAllGradeConsumption.toLocaleString('id-ID')} L</td>
                                            <td className="py-3.5 px-4 text-center font-bold text-xs">100%</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                    </div>
                )}

                {/* ========================================================================= */}
                {/* TAB 3: DATA TABEL & MONITORING PENGISIAN                                  */}
                {/* ========================================================================= */}
                {activeTab === 'data' && (
                    <div className="space-y-6">

                        {/* Summary KPI Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm">
                                <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider">
                                    <span>Total Konsumsi Pelumas</span>
                                    <Droplet size={18} className="text-emerald-600" />
                                </div>
                                <div className="mt-2 text-3xl font-black text-gray-900 font-mono">
                                    {summary.total_konsumsi || 0} <span className="text-base font-bold text-gray-500">Liter</span>
                                </div>
                                <div className="mt-1 text-xs text-gray-500 font-semibold">
                                    {summary.total_unit || 0} Unit &bull; {summary.total_pengisian || 0} Refill
                                </div>
                            </div>

                            <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm">
                                <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider">
                                    <span>Rata-Rata Rasio Pelumas</span>
                                    <Gauge size={18} className="text-blue-600" />
                                </div>
                                <div className="mt-2 text-3xl font-black text-gray-900 font-mono">
                                    {summary.avg_1000 || '0.00'} <span className="text-base font-bold text-gray-500">L / 100 HM</span>
                                </div>
                                <div className="mt-1 text-xs text-gray-500 font-semibold">
                                    Target Standar: <span className="font-bold text-emerald-600">&le; 0.50 L/100 HM</span>
                                </div>
                            </div>

                            <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm">
                                <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider">
                                    <span>Unit Over Limit (Waspada)</span>
                                    <AlertTriangle size={18} className="text-red-500" />
                                </div>
                                <div className="mt-2 text-3xl font-black text-red-600 font-mono">
                                    {summary.over_limit_count || 0} <span className="text-base font-bold text-gray-500">Kasus</span>
                                </div>
                                <div className="mt-1 text-xs text-red-600 font-semibold">
                                    {summary.over_limit_pct || 0}% Dari total pengisian
                                </div>
                            </div>

                            <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm">
                                <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider">
                                    <span>Kondisi Normal</span>
                                    <CheckCircle2 size={18} className="text-emerald-600" />
                                </div>
                                <div className="mt-2 text-3xl font-black text-emerald-600 font-mono">
                                    {(summary.total_pengisian || 0) - (summary.over_limit_count || 0)} <span className="text-base font-bold text-gray-500">Refill</span>
                                </div>
                                <div className="mt-1 text-xs text-gray-500 font-semibold">
                                    Kepatuhan pelumasan optimal
                                </div>
                            </div>
                        </div>

                        {/* Search & Filter Panel */}
                        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5">
                            <form onSubmit={handleFilterSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                    {/* Search Input */}
                                    <div className="col-span-1 sm:col-span-2">
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                            Pencarian Cepat
                                        </label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <input 
                                                type="text" 
                                                placeholder="Cari kode unit, model, pelumas, pic..."
                                                value={search}
                                                onChange={e => setSearch(e.target.value)}
                                                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                                            />
                                        </div>
                                    </div>

                                    {/* Date From */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                            Dari Tanggal
                                        </label>
                                        <input 
                                            type="date"
                                            value={dateFrom}
                                            onChange={e => setDateFrom(e.target.value)}
                                            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                                        />
                                    </div>

                                    {/* Date To */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                            Sampai Tanggal
                                        </label>
                                        <input 
                                            type="date"
                                            value={dateTo}
                                            onChange={e => setDateTo(e.target.value)}
                                            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                                        />
                                    </div>

                                    {/* Type Pelumas */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                            Grade Pelumas
                                        </label>
                                        <select
                                            value={typeOliFilter}
                                            onChange={e => setTypeOliFilter(e.target.value)}
                                            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                                        >
                                            <option value="">Semua Pelumas</option>
                                            {standardOilGrades.map(o => (
                                                <option key={o} value={o}>{o}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                            Status Rasio
                                        </label>
                                        <select
                                            value={statusFilter}
                                            onChange={e => setStatusFilter(e.target.value)}
                                            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                                        >
                                            <option value="">Semua Status</option>
                                            <option value="Normal">Normal</option>
                                            <option value="Perlu Monitoring">Perlu Monitoring</option>
                                            <option value="Over Limit">Over Limit</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
                                    >
                                        <RefreshCw size={14} />
                                        <span>Reset Filter</span>
                                    </button>
                                    <button
                                        type="submit"
                                        className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition"
                                    >
                                        <Search size={14} />
                                        <span>Terapkan Filter</span>
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Data Table */}
                        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
                            <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-base font-black text-gray-900 tracking-tight">
                                        Tabel Riwayat Pengisian &amp; Konsumsi Oli
                                    </h3>
                                    <p className="text-xs text-gray-500 font-semibold mt-0.5">
                                        Menampilkan catatan pemakaian pelumas, rasio per 100 HM, status, dan jenis service (Schedule / Unschedule)
                                    </p>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm border-collapse">
                                    <thead className="bg-emerald-50/60 border-b border-gray-200 text-xs font-black text-emerald-950 uppercase tracking-wider">
                                        <tr>
                                            <th className="py-4 px-4">No</th>
                                            <th className="py-4 px-4">Tanggal</th>
                                            <th className="py-4 px-4">Kode Unit</th>
                                            <th className="py-4 px-4">Model / Equipment</th>
                                            <th className="py-4 px-4">Komponen</th>
                                            <th className="py-4 px-4">Tipe Service</th>
                                            <th className="py-4 px-4">Tipe Pelumas</th>
                                            <th className="py-4 px-4 text-right">HM Saat Refill</th>
                                            <th className="py-4 px-4 text-right">HM Jalan</th>
                                            <th className="py-4 px-4 text-right">Refill (L)</th>
                                            <th className="py-4 px-4 text-right">L / 100 HM</th>
                                            <th className="py-4 px-4 text-center">Status</th>
                                            <th className="py-4 px-4">PIC</th>
                                            <th className="py-4 px-4 text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-150">
                                        {tableData.length > 0 ? (
                                            tableData.map((row) => (
                                                <tr key={row.id} className="hover:bg-emerald-50/30 transition-colors">
                                                    <td className="py-3.5 px-4 font-semibold text-gray-500 text-xs">{row.no}</td>
                                                    <td className="py-3.5 px-4 font-bold text-gray-900 whitespace-nowrap">{row.date}</td>
                                                    <td className="py-3.5 px-4 font-black text-emerald-700 font-mono">{row.code_unit}</td>
                                                    <td className="py-3.5 px-4 font-semibold text-gray-700 text-xs">{row.model}</td>
                                                    <td className="py-3.5 px-4">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-700">
                                                            {row.component}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-4">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black ${
                                                            row.service_type === 'Unschedule' 
                                                                ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                                                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                                        }`}>
                                                            {row.service_type || 'Schedule'}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-4 font-bold text-gray-800 text-xs">{row.type_oli}</td>
                                                    <td className="py-3.5 px-4 text-right font-mono text-gray-900 font-bold text-xs">{row.hm}</td>
                                                    <td className="py-3.5 px-4 text-right font-mono text-emerald-700 font-bold text-xs">{row.hm_diff}</td>
                                                    <td className="py-3.5 px-4 text-right font-mono text-base font-black text-gray-900">{row.pengisian}</td>
                                                    <td className="py-3.5 px-4 text-right font-mono text-xs font-bold text-gray-800">{row.l_per_1000}</td>
                                                    <td className="py-3.5 px-4 text-center">
                                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black ${
                                                            row.status === 'Over Limit'
                                                                ? 'bg-red-100 text-red-800'
                                                                : row.status === 'Perlu Monitoring'
                                                                ? 'bg-amber-100 text-amber-800'
                                                                : 'bg-emerald-100 text-emerald-800'
                                                        }`}>
                                                            {row.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-4 font-semibold text-gray-600 text-xs">{row.pic}</td>
                                                    <td className="py-3.5 px-4 text-center">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => setViewData(row)}
                                                                className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                                                                title="Lihat Detail"
                                                            >
                                                                <Eye size={15} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOpenEditModal(row)}
                                                                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                                title="Edit Data"
                                                            >
                                                                <Edit3 size={15} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDelete(row)}
                                                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                                title="Hapus Data"
                                                            >
                                                                <Trash2 size={15} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={14} className="py-12 text-center text-gray-400 font-semibold">
                                                    Tidak ada data pengisian oli ditemukan.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {pagination.links && pagination.links.length > 3 && (
                                <div className="p-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500">
                                    <div>
                                        Menampilkan <span className="font-bold text-gray-900">{pagination.from || 0}</span> sampai{' '}
                                        <span className="font-bold text-gray-900">{pagination.to || 0}</span> dari{' '}
                                        <span className="font-bold text-gray-900">{pagination.total || 0}</span> data
                                    </div>
                                    <div className="flex items-center gap-1 overflow-x-auto">
                                        {pagination.links.map((link, idx) => (
                                            <Link
                                                key={idx}
                                                href={link.url || '#'}
                                                preserveState
                                                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                                                    link.active
                                                        ? 'bg-emerald-600 text-white'
                                                        : link.url
                                                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                        : 'text-gray-300 pointer-events-none'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                )}

            </div>

            {/* ========================================================================= */}
            {/* CREATE / EDIT MODAL                                                       */}
            {/* ========================================================================= */}
            {isFormModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
                    <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-2xl overflow-hidden my-8">
                        <div className="p-6 bg-gradient-to-r from-emerald-700 to-emerald-600 text-white flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black">
                                    {modalMode === 'create' ? 'Input Pengisian Pelumas Baru' : 'Edit Catatan Pengisian Oli'}
                                </h3>
                                <p className="text-xs text-emerald-100 font-semibold mt-0.5">
                                    Pastikan pembacaan HM dan volume liter terisi akurat
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsFormModalOpen(false)}
                                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                            
                            {/* Service Type Selection (Schedule vs Unschedule) */}
                            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
                                <label className="block text-xs font-black text-gray-800 uppercase tracking-wider mb-2">
                                    Kategori Service (Tipe Pengisian):
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, service_type: 'Schedule' }))}
                                        className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black transition-all ${
                                            formData.service_type === 'Schedule'
                                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 ring-2 ring-emerald-500'
                                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        <CheckCircle2 size={16} />
                                        <span>Schedule (Periodical Service)</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, service_type: 'Unschedule' }))}
                                        className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black transition-all ${
                                            formData.service_type === 'Unschedule'
                                                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20 ring-2 ring-rose-500'
                                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        <AlertTriangle size={16} />
                                        <span>Unschedule (Top Up Darurat)</span>
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Unit Code */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                        Pilih Kode Unit <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.code_unit}
                                        onChange={handleUnitSelect}
                                        required
                                        className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                                    >
                                        <option value="">-- Pilih Unit --</option>
                                        {units.map(u => (
                                            <option key={u.code_unit} value={u.code_unit}>
                                                {u.code_unit} - {u.model}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Tanggal */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                        Tanggal Pengisian <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="date"
                                        value={formData.date}
                                        onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                        required
                                        className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>

                                {/* HM Saat Refill */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                        HM Saat Refill <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="number"
                                        step="0.1"
                                        value={formData.hm}
                                        onChange={e => setFormData(prev => ({ ...prev, hm: e.target.value }))}
                                        placeholder="0.0"
                                        required
                                        className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                                    />
                                </div>


                                {/* Tipe Oli */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                        Grade Pelumas <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.type_oli}
                                        onChange={e => setFormData(prev => ({ ...prev, type_oli: e.target.value }))}
                                        required
                                        className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold"
                                    >
                                        {oilTypes.map(o => (
                                            <option key={o} value={o}>{o}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Volume Pengisian */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                        Refill Volume (Liter) <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="number"
                                        step="0.1"
                                        min="0.1"
                                        value={formData.pengisian}
                                        onChange={e => setFormData(prev => ({ ...prev, pengisian: e.target.value }))}
                                        placeholder="Contoh: 18.5"
                                        required
                                        className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono font-black text-emerald-800"
                                    />
                                </div>

                                {/* PIC */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                        PIC / Mekanik
                                    </label>
                                    <select 
                                        value={formData.pic}
                                        onChange={e => setFormData(prev => ({ ...prev, pic: e.target.value }))}
                                        className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold text-gray-800"
                                    >
                                        <option value="">-- Pilih PIC / Mekanik --</option>
                                        {manpowerList && manpowerList.length > 0 ? (
                                            manpowerList.map(mp => (
                                                <option key={mp.id} value={mp.nama}>
                                                    {mp.nama} {mp.bagian ? `(${mp.bagian})` : ''}
                                                </option>
                                            ))
                                        ) : (
                                            <option value="Admin Plant">Admin Plant</option>
                                        )}
                                        {formData.pic && !manpowerList?.some(mp => mp.nama === formData.pic) && (
                                            <option value={formData.pic}>{formData.pic}</option>
                                        )}
                                    </select>
                                </div>
                            </div>

                            {/* Live Calculation Box */}
                            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
                                <div>
                                    <div className="text-gray-500 font-bold uppercase">HM Jalan (Diff)</div>
                                    <div className="font-mono font-black text-gray-900 text-sm">{liveCalculation.hmDiff} HM</div>
                                </div>
                                <div>
                                    <div className="text-gray-500 font-bold uppercase">Estimasi Rasio</div>
                                    <div className="font-mono font-black text-emerald-700 text-sm">{liveCalculation.ratio} L/100 HM</div>
                                </div>
                                <div>
                                    <div className="text-gray-500 font-bold uppercase">Batas Standar</div>
                                    <div className="font-mono font-bold text-gray-700 text-sm">&le; {liveCalculation.batas} L/100</div>
                                </div>
                                <div>
                                    <div className="text-gray-500 font-bold uppercase">Prediksi Status</div>
                                    <span className={`inline-flex px-2.5 py-0.5 rounded-full font-black text-xs ${liveCalculation.statusColor}`}>
                                        {liveCalculation.status}
                                    </span>
                                </div>
                            </div>

                            {/* Remarks */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                    Catatan Tambahan / Remarks
                                </label>
                                <textarea
                                    rows={2}
                                    value={formData.remarks}
                                    onChange={e => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            {/* Checkbox Update Master Unit HM */}
                            {modalMode === 'create' && (
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="checkbox"
                                        id="update_hm_check"
                                        checked={formData.update_unit_hm}
                                        onChange={e => setFormData(prev => ({ ...prev, update_unit_hm: e.target.checked }))}
                                        className="rounded text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <label htmlFor="update_hm_check" className="text-xs font-bold text-gray-700 cursor-pointer">
                                        Perbarui HM Master Unit saat ini jika HM refill lebih tinggi
                                    </label>
                                </div>
                            )}

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => setIsFormModalOpen(false)}
                                    className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2.5 text-sm font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/30 transition disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Menyimpan...' : 'Simpan Data'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW DETAIL MODAL                                                         */}
            {/* ========================================================================= */}
            {viewData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-lg overflow-hidden">
                        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                                    <Droplet size={22} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black font-mono">{viewData.code_unit}</h3>
                                    <p className="text-xs text-slate-400 font-semibold">{viewData.model} &bull; {viewData.department}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setViewData(null)}
                                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4 text-sm">
                            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-100">
                                <div>
                                    <span className="text-xs text-gray-400 font-bold uppercase">Tanggal Pengisian</span>
                                    <div className="font-bold text-gray-900 mt-0.5">{viewData.date}</div>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-400 font-bold uppercase">Kategori Service</span>
                                    <div className="mt-0.5">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black ${
                                            viewData.service_type === 'Unschedule' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                                        }`}>
                                            {viewData.service_type || 'Schedule'}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-400 font-bold uppercase">Komponen</span>
                                    <div className="font-bold text-gray-900 mt-0.5">{viewData.component}</div>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-400 font-bold uppercase">Tipe Pelumas</span>
                                    <div className="font-bold text-gray-900 mt-0.5">{viewData.type_oli}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-2xl font-mono text-center">
                                <div>
                                    <div className="text-[10px] text-gray-400 font-bold uppercase">HM Saat Refill</div>
                                    <div className="text-sm font-black text-gray-900">{viewData.hm}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-gray-400 font-bold uppercase">HM Jalan</div>
                                    <div className="text-sm font-black text-emerald-700">{viewData.hm_diff}</div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl">
                                <div>
                                    <div className="text-xs text-gray-500 font-bold uppercase">Volume Pengisian</div>
                                    <div className="text-2xl font-black text-gray-900 font-mono">{viewData.pengisian} Liter</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-500 font-bold uppercase">Rasio Pemakaian</div>
                                    <div className="text-lg font-black text-emerald-700 font-mono">{viewData.l_per_1000} L / 100 HM</div>
                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black mt-1 ${
                                        viewData.status === 'Over Limit' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                                    }`}>
                                        {viewData.status}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <span className="text-xs text-gray-400 font-bold uppercase">Keterangan / Remarks:</span>
                                <p className="mt-1 text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs leading-relaxed">
                                    {viewData.remarks || '-'}
                                </p>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-gray-500">
                                <span>PIC: <strong className="text-gray-800">{viewData.pic}</strong></span>
                                <span>Dicatat: {viewData.created_at || '-'}</span>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 border-t border-gray-100 text-right">
                            <button
                                type="button"
                                onClick={() => setViewData(null)}
                                className="px-5 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 rounded-xl transition"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* IMPORT MODAL                                                              */}
            {/* ========================================================================= */}
            {isImportModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden">
                        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FileSpreadsheet className="text-emerald-400" size={24} />
                                <div>
                                    <h3 className="text-lg font-black">Import File Excel</h3>
                                    <p className="text-xs text-slate-400 font-semibold mt-0.5">Upload catatan konsumsi oli massal</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsImportModalOpen(false)}
                                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleImportSubmit} className="p-6 space-y-4">
                            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-emerald-500 transition">
                                <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                                <label className="block text-sm font-bold text-gray-700 cursor-pointer">
                                    <span>Pilih file Excel (.xlsx, .xls, .csv)</span>
                                    <input 
                                        type="file" 
                                        accept=".xlsx,.xls,.csv"
                                        onChange={e => setImportFile(e.target.files[0] || null)}
                                        className="hidden"
                                        required
                                    />
                                </label>
                                {importFile && (
                                    <p className="mt-2 text-xs font-black text-emerald-600">
                                        File terpilih: {importFile.name}
                                    </p>
                                )}
                            </div>

                            <div className="text-xs text-gray-600 bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-200">
                                <div className="font-bold text-gray-800">Format Template Excel Resmi:</div>
                                <p className="text-gray-500 mt-0.5">
                                    Mendukung format <strong>Daily Fuel & Lube Dispensing Sheet</strong> (Kode Unit, Shift, Tanggal, HM, Dispenser, dan 26 Kolom Grade Pelumas SCH / UNS).
                                </p>
                                <div className="mt-2.5">
                                    <a 
                                        href={route('oil-consumption.template')}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black text-white bg-emerald-700 hover:bg-emerald-800 shadow-sm transition"
                                    >
                                        <Download size={14} /> Download Template Excel (Format Matriks)
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => setIsImportModalOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={!importFile || isImporting}
                                    className="px-5 py-2 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition disabled:opacity-50"
                                >
                                    {isImporting ? 'Mengimpor...' : 'Proses Import'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </AuthenticatedLayout>
    );
}
