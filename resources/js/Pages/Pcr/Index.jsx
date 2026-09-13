import React, { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, info: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, info) {
        console.error("ErrorBoundary caught an error", error, info);
        this.setState({ info });
    }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '2rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', margin: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Something went wrong.</h2>
                    <pre style={{ marginTop: '1rem', whiteSpace: 'pre-wrap', backgroundColor: '#fecaca', padding: '1rem' }}>{this.state.error?.toString()}</pre>
                    <pre style={{ marginTop: '1rem', whiteSpace: 'pre-wrap', backgroundColor: '#fecaca', padding: '1rem' }}>{this.state.info?.componentStack}</pre>
                </div>
            );
        }
        return this.props.children;
    }
}

function IndexContent({ auth, data, stats, units = [] }) {
    const [activeTab, setActiveTab] = useState('uc');

    // Form filters
    const [departmentFilter, setDepartmentFilter] = useState('');
    const [jenisUnitFilter, setJenisUnitFilter] = useState('');
    const [modelFilter, setModelFilter] = useState('');
    const [lokasiFilter, setLokasiFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [searchFilter, setSearchFilter] = useState('');

    // State for selected PCR unit
    const [selectedPcr, setSelectedPcr] = useState(null);

    // State for delete all modal & processing
    const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
    const [isDeletingAll, setIsDeletingAll] = useState(false);

    // State for Plan Modal (Tambah / Edit)
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
    const [editingId, setEditingId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [formData, setFormData] = useState({
        unit_id: '',
        component: '',
        qty: 1,
        part_number: '',
        description: '',
        target_life_time: 6000,
        hm_current: 0,
        hm_replace: 0,
        date_replace: '',
        brand_produk: '',
        status_penggantian: 'Sudah Diganti',
        worn_out: '',
        inspection_date: '',
    });

    // 25 Standard Undercarriage Components List
    const initialUcComponents = [
        { no: 1, part_number: '14X-30-00142', name: 'Carrier Roller RHF', status: 'Sudah', status_penggantian: 'Sudah Diganti', target_life_time: 3000, hm_replace: 0, date_replace: '', brand: '', remarks: '' },
        { no: 2, part_number: '14X-30-00142', name: 'Carrier Roller RHR', status: 'Belum', status_penggantian: 'Belum Diganti', target_life_time: 3000, hm_replace: 0, date_replace: '', brand: '', remarks: '' },
        { no: 3, part_number: '14X-30-00142', name: 'Carrier Roller LHF', status: 'Belum', status_penggantian: 'Belum Diganti', target_life_time: 3000, hm_replace: 0, date_replace: '', brand: '', remarks: '' },
        { no: 4, part_number: '14X-30-00142', name: 'Carrier Roller LHR', status: 'Belum', status_penggantian: 'Belum Diganti', target_life_time: 3000, hm_replace: 0, date_replace: '', brand: '', remarks: '' },
        { no: 5, part_number: '14X-27-15112', name: 'Segment RH', status: 'Belum', status_penggantian: 'Belum Diganti', target_life_time: 4000, hm_replace: 0, date_replace: '', brand: '', remarks: '' },
        { no: 6, part_number: '14X-27-15112', name: 'Segment LH', status: 'Belum', status_penggantian: 'Belum Diganti', target_life_time: 4000, hm_replace: 0, date_replace: '', brand: '', remarks: '' },
        { no: 7, part_number: '14X-30-00087', name: 'Track Roller RH 1', status: 'Belum', status_penggantian: 'Belum Diganti', target_life_time: 3000, hm_replace: 0, date_replace: '', brand: '', remarks: '' },
        { no: 8, part_number: '14X-30-00087', name: 'Track Roller RH 2', status: 'Belum', status_penggantian: 'Belum Diganti', target_life_time: 3000, hm_replace: 0, date_replace: '', brand: '', remarks: '' },
        { no: 9, part_number: '14X-30-00087', name: 'Track Roller RH 3', status: 'Belum', status_penggantian: 'Belum Diganti', target_life_time: 3000, hm_replace: 0, date_replace: '', brand: '', remarks: '' },
        { no: 10, part_number: '14X-30-00087', name: 'Track Roller RH 4', status: 'Belum', status_penggantian: 'Belum Diganti', target_life_time: 3000, hm_replace: 0, date_replace: '', brand: '', remarks: '' },
        { no: 11, part_number: '14X-30-00096', name: 'Track Roller RH 5', status: 'Belum', status_penggantian: 'Belum Diganti', target_life_time: 3000, hm_replace: 0, date_replace: '', brand: '', remarks: '' },
        { no: 12, part_number: '14X-30-00096', name: 'Track Roller RH 6', status: 'Belum', status_penggantian: 'Belum Diganti', target_life_time: 3000, hm_replace: 0, date_replace: '', brand: '', remarks: '' },
        { no: 13, part_number: '14X-30-00096', name: 'Track Roller RH 7', status: 'Belum', status_penggantian: 'Belum Diganti', target_life_time: 3000, hm_replace: 0, date_replace: '', brand: '', remarks: '' },
        { no: 14, part_number: '14X-30-00087', name: 'Track Roller LH 1', status: 'Belum', status_penggantian: 'Belum Diganti', target_life_time: 3000, hm_replace: 0, date_replace: '', brand: '', remarks: '' },
        { no: 15, part_number: '14X-30-00087', name: 'Track Roller LH 2', status: 'Belum', status_penggantian: 'Belum Diganti', target_life_time: 3000, hm_replace: 0, date_replace: '', brand: '', remarks: '' },
        { no: 16, part_number: '14U-32-01251', name: 'Track Link RH', status: 'Belum', status_penggantian: 'Belum Diganti', target_life_time: 4000, hm_replace: 0, date_replace: '', brand: '', remarks: '' },
        { no: 17, part_number: '14U-32-01251', name: 'Track Link LH', status: 'Belum', status_penggantian: 'Belum Diganti', target_life_time: 4000, hm_replace: 0, date_replace: '', brand: '', remarks: '' },
        { no: 18, part_number: '14X-30-00087', name: 'Track Roller LH 3', status: 'Belum', status_penggantian: 'Belum Diganti', target_life_time: 3000, hm_replace: 0, date_replace: '', brand: '', remarks: '' },
        { no: 19, part_number: '14X-30-00087', name: 'Track Roller LH 4', status: 'Belum', status_penggantian: 'Belum Diganti', target_life_time: 3000, hm_replace: 0, date_replace: '', brand: '', remarks: '' },
        { no: 20, part_number: '14X-30-00096', name: 'Track Roller LH 5', status: 'Belum', status_penggantian: 'Belum Diganti', target_life_time: 3000, hm_replace: 0, date_replace: '', brand: '', remarks: '' },
        { no: 21, part_number: '14X-30-00096', name: 'Track Roller LH 6', status: 'Belum', status_penggantian: 'Belum Diganti', target_life_time: 3000, hm_replace: 0, date_replace: '', brand: '', remarks: '' },
        { no: 22, part_number: '14X-30-00096', name: 'Track Roller LH 7', status: 'Belum', status_penggantian: 'Belum Diganti', target_life_time: 3000, hm_replace: 0, date_replace: '', brand: '', remarks: '' },
        { no: 23, part_number: '14X-30-00116', name: 'Idler LH', status: 'Belum', status_penggantian: 'Belum Diganti', target_life_time: 4000, hm_replace: 0, date_replace: '', brand: '', remarks: '' },
        { no: 24, part_number: '14X-30-00116', name: 'Idler RH', status: 'Belum', status_penggantian: 'Belum Diganti', target_life_time: 4000, hm_replace: 0, date_replace: '', brand: '', remarks: '' },
    ];

    const [ucComponents, setUcComponents] = useState(initialUcComponents);
    const [selectedCompNo, setSelectedCompNo] = useState(1);
    const [searchUcComp, setSearchUcComp] = useState('');
    const [checkedCompNos, setCheckedCompNos] = useState(new Set([1]));
    const [sortConfig, setSortConfig] = useState({ key: 'no', direction: 'asc' });

    // File import ref & state
    const fileInputRef = useRef(null);
    const [isImporting, setIsImporting] = useState(false);

    // View Mode (grid vs table) and Pagination
    const [viewMode, setViewMode] = useState('grid');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 24;

    // Classification helpers
    const getEquipmentImage = (item) => {
        const code = (item?.code_unit || '').toUpperCase();
        const model = (item?.model || '').toUpperCase();
        const equip = (item?.equipment || '').toUpperCase();
        
        if (code.startsWith('MD') || code.startsWith('DZ') || code.includes('D85') || model.includes('D85') || equip.includes('DOZER') || equip.includes('BULLDOZER')) {
            return '/images/dozer.jpg';
        }
        if (code.startsWith('ME') || code.startsWith('EX') || model.includes('PC') || equip.includes('EXCAVATOR')) {
            return '/images/excavator.jpg';
        }
        return '/images/dumptruck.jpg';
    };

    const isUndercarriageItem = (item) => {
        if (!item) return false;
        const comp = (item.component || '').toUpperCase();
        const desc = (item.description || '').toUpperCase();
        return (
            comp.includes('CARRIER ROLLER') ||
            comp.includes('TRACK ROLLER') ||
            comp.includes('IDLER') ||
            comp.includes('SEGMENT') ||
            comp.includes('TRACK LINK') ||
            comp.includes('TRACK SHOE') ||
            comp.includes('SPROCKET') ||
            comp.includes('GROUSER') ||
            comp.includes('UNDERCARRIAGE') ||
            comp === 'UC' ||
            desc.includes('UNDERCARRIAGE')
        );
    };

    // Tab 1: Wheel equipment / wheel components
    const isWheelItem = (item) => {
        if (!item) return false;
        if (isUndercarriageItem(item)) return false;
        const code = (item.code_unit || '').toUpperCase();
        const equip = (item.equipment || '').toUpperCase();
        const comp = (item.component || '').toUpperCase();
        
        if (
            code.startsWith('OHT') || 
            code.startsWith('DT') || 
            code.startsWith('HD') || 
            code.startsWith('WL') || 
            code.startsWith('GD') || 
            code.startsWith('TRUCK') || 
            equip.includes('TRUCK') || 
            equip.includes('WHEEL') || 
            equip.includes('GRADER') || 
            equip.includes('LOADER')
        ) {
            return true;
        }
        
        return (
            comp.includes('TYRE') ||
            comp.includes('TIRE') ||
            comp.includes('WHEEL') ||
            comp.includes('DIFFERENTIAL') ||
            comp.includes('AXLE') ||
            comp.includes('SUSPENSION') ||
            comp.includes('SLACK ADJUSTER') ||
            comp.includes('BRAKE CHAMBER')
        );
    };

    // Tab 2: Track units other components (Engine, Transmission, Hydraulic Pump, Cylinders, Final Drive, etc.)
    const isTrackItem = (item) => {
        if (!item) return false;
        if (isUndercarriageItem(item) || isWheelItem(item)) return false;
        return true;
    };

    const wheelCount = (data || []).filter(item => isWheelItem(item)).length;
    const wheelUnitCount = new Set((data || []).filter(item => isWheelItem(item)).map(i => i.code_unit)).size;
    const trackCount = (data || []).filter(item => isTrackItem(item)).length;
    const trackUnitCount = new Set((data || []).filter(item => isTrackItem(item)).map(i => i.code_unit)).size;

    // Filter data by active tab
    const tabFilteredData = (data || []).filter(item => {
        if (activeTab === 'uc') return isUndercarriageItem(item);
        if (activeTab === 'wheel') return isWheelItem(item);
        if (activeTab === 'track') return isTrackItem(item);
        return false;
    });

    // Filter data by search and dropdowns
    const displayData = tabFilteredData.filter(item => {
        if (jenisUnitFilter && item.equipment !== jenisUnitFilter) return false;
        if (modelFilter && item.model !== modelFilter) return false;
        if (statusFilter && item.status !== statusFilter) return false;
        if (searchFilter) {
            const q = searchFilter.toLowerCase();
            const match = (item.code_unit && item.code_unit.toLowerCase().includes(q)) ||
                          (item.component && item.component.toLowerCase().includes(q)) ||
                          (item.part_number && item.part_number.toLowerCase().includes(q)) ||
                          (item.model && item.model.toLowerCase().includes(q));
            if (!match) return false;
        }
        return true;
    });

    // Aggregated Unit Groups for Grid View
    const activeUnitGroups = React.useMemo(() => {
        const map = new Map();
        (displayData || []).forEach(item => {
            const key = item.code_unit || item.unit_id;
            if (!map.has(key)) {
                map.set(key, {
                    id: item.id,
                    unit_id: item.unit_id,
                    code_unit: item.code_unit,
                    model: item.model,
                    equipment: item.equipment,
                    serial_number: item.serial_number,
                    hm_current: item.hm_current,
                    hm_current_formatted: item.hm_current_formatted,
                    components: [],
                });
            }
            map.get(key).components.push(item);
        });

        return Array.from(map.values()).map(unit => {
            const comps = unit.components;
            const totalComps = comps.length;
            const overdueComps = comps.filter(c => (c.sisa_hm !== undefined ? c.sisa_hm < 0 : c.status === 'OVERDUE'));
            const dueSoonComps = comps.filter(c => !overdueComps.includes(c) && ((c.sisa_hm !== undefined && c.sisa_hm <= 500) || c.status === 'DUE SOON'));
            const normalComps = comps.filter(c => !overdueComps.includes(c) && !dueSoonComps.includes(c));

            let worstStatus = 'ON SCHEDULE';
            if (overdueComps.length > 0) worstStatus = 'OVERDUE';
            else if (dueSoonComps.length > 0) worstStatus = 'DUE SOON';

            const minSisaHm = comps.reduce((min, c) => (c.sisa_hm !== undefined && c.sisa_hm < min ? c.sisa_hm : min), comps[0]?.sisa_hm ?? 0);
            const worstComp = comps.find(c => c.sisa_hm === minSisaHm) || comps[0];
            const maxUsedHm = comps.reduce((max, c) => {
                const used = Math.max(0, (c.hm_current || 0) - (c.hm_replace || 0));
                return used > max ? used : max;
            }, 0);
            const refTarget = worstComp?.target_life_time || (activeTab === 'wheel' ? 18000 : 14000);
            const progressPct = refTarget > 0 ? Math.min(100, Math.round((maxUsedHm / refTarget) * 100)) : 0;

            return {
                ...unit,
                total_components: totalComps,
                overdue_count: overdueComps.length,
                due_soon_count: dueSoonComps.length,
                normal_count: normalComps.length,
                worst_status: worstStatus,
                min_sisa_hm: minSisaHm,
                worst_comp: worstComp,
                progress_pct: progressPct,
                target_life_time: refTarget,
                hm_replace: worstComp?.hm_replace || 0,
            };
        });
    }, [activeTab, displayData]);

    // Dynamic stats
    const isGrid = viewMode === 'grid';
    const activeStats = {
        total: isGrid ? activeUnitGroups.length : displayData.length,
        on_schedule: isGrid 
            ? activeUnitGroups.filter(u => u.worst_status === 'ON SCHEDULE').length 
            : displayData.filter(i => i.status === 'ON SCHEDULE').length,
        due_soon: isGrid 
            ? activeUnitGroups.filter(u => u.worst_status === 'DUE SOON').length 
            : displayData.filter(i => i.status === 'DUE SOON').length,
        overdue: isGrid 
            ? activeUnitGroups.filter(u => u.worst_status === 'OVERDUE').length 
            : displayData.filter(i => i.status === 'OVERDUE').length,
    };
    activeStats.on_schedule_pct = activeStats.total > 0 ? ((activeStats.on_schedule / activeStats.total) * 100).toFixed(1) : (stats?.on_schedule_pct || '0.0');
    activeStats.due_soon_pct = activeStats.total > 0 ? ((activeStats.due_soon / activeStats.total) * 100).toFixed(1) : (stats?.due_soon_pct || '0.0');
    activeStats.overdue_pct = activeStats.total > 0 ? ((activeStats.overdue / activeStats.total) * 100).toFixed(1) : (stats?.overdue_pct || '0.0');

    // Pagination calculations
    const activeListLength = isGrid ? activeUnitGroups.length : displayData.length;
    const totalPages = Math.ceil(activeListLength / itemsPerPage) || 1;
    const paginatedData = displayData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const paginatedUnitGroups = activeUnitGroups.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, viewMode, searchFilter, statusFilter, modelFilter, jenisUnitFilter, departmentFilter, lokasiFilter]);

    // Auto-select item when display data changes
    useEffect(() => {
        if (displayData && displayData.length > 0) {
            if (!selectedPcr || !displayData.some(d => d.id === selectedPcr.id)) {
                setSelectedPcr(displayData[0]);
            }
        } else {
            setSelectedPcr(null);
        }
    }, [activeTab, data]);

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        router.get('/pcr-uc', {
            code_unit: searchFilter,
        }, { preserveState: true });
    };

    const handleReset = () => {
        setDepartmentFilter('');
        setJenisUnitFilter('');
        setModelFilter('');
        setLokasiFilter('');
        setStatusFilter('');
        setSearchFilter('');
        router.get('/pcr-uc', {}, { preserveState: true });
    };

    const handleSelectUcComponent = (comp) => {
        setSelectedCompNo(comp.no);
        setEditingId(comp.id || null);
        setFormData(prev => ({
            ...prev,
            part_number: comp.part_number,
            component: comp.name,
            qty: comp.qty || 1,
            status_penggantian: comp.status_penggantian || (comp.status === 'Sudah' ? 'Sudah Diganti' : 'Belum Diganti'),
            target_life_time: comp.target_life_time || 3000,
            hm_replace: comp.hm_replace || 0,
            date_replace: comp.date_replace || '',
            brand_produk: comp.brand || '',
            description: comp.remarks || '',
        }));
    };

    const handleToggleCompCheck = (no) => {
        setCheckedCompNos(prev => {
            const next = new Set(prev);
            if (next.has(no)) {
                next.delete(no);
            } else {
                next.add(no);
            }
            return next;
        });
        // Auto-select the component to populate the detail form
        const comp = ucComponents.find(c => c.no === no);
        if (comp) {
            setSelectedCompNo(comp.no);
            setEditingId(comp.id || null);
            setFormData(prev => ({
                ...prev,
                part_number: comp.part_number,
                component: comp.name,
                status_penggantian: comp.status_penggantian || (comp.status === 'Sudah' ? 'Sudah Diganti' : 'Belum Diganti'),
                target_life_time: comp.target_life_time || 3000,
                hm_replace: comp.hm_replace || 0,
                date_replace: comp.date_replace || '',
                brand_produk: comp.brand || '',
                description: comp.remarks || '',
            }));
        }
    };

    const handleSelectAllUc = () => {
        if (checkedCompNos.size === ucComponents.length) {
            // Deselect all
            setCheckedCompNos(new Set());
        } else {
            // Select all — load first comp ke form agar bisa langsung diisi
            setCheckedCompNos(new Set(ucComponents.map(c => c.no)));
            const firstComp = ucComponents[0];
            if (firstComp) {
                setSelectedCompNo(firstComp.no);
                // Set form ke mode bulk: kosongkan field yang ingin diisi massal
                setFormData(prev => ({
                    ...prev,
                    hm_replace: '',
                    date_replace: '',
                    brand_produk: '',
                    description: '',
                    worn_out: '',
                    inspection_date: '',
                    status_penggantian: prev.status_penggantian || 'Sudah Diganti',
                }));
            }
        }
    };

    const handleResetUcStatus = () => {
        setUcComponents(prev => prev.map(c => ({
            ...c,
            status: 'Belum',
            status_penggantian: 'Belum Diganti'
        })));
        setFormData(prev => ({
            ...prev,
            status_penggantian: 'Belum Diganti'
        }));
    };

    const handleSortUc = (field) => {
        setSortConfig(prev => {
            const direction = (prev.key === field && prev.direction === 'asc') ? 'desc' : 'asc';
            return { key: field, direction };
        });
    };

    // Helper: safely parse HM values that may use comma as decimal separator
    const parseHm = (val) => {
        if (val === null || val === undefined || val === '') return 0;
        return parseFloat(String(val).replace(',', '.')) || 0;
    };

    const handleUcFormFieldChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setUcComponents(prev => prev.map(comp => {
            // Ketika lebih dari 1 komponen dicentang, SEMUA field ikut update ke semua yg dicentang
            const shouldUpdate = checkedCompNos.size > 1
                ? checkedCompNos.has(comp.no)
                : comp.no === selectedCompNo;

            if (shouldUpdate) {
                const updated = { ...comp };
                const isBulk = checkedCompNos.size > 1;

                if (field === 'part_number' && (!isBulk || checkedCompNos.size === 1)) updated.part_number = value;
                if (field === 'component' && (!isBulk || checkedCompNos.size === 1)) updated.name = value;
                if (field === 'target_life_time' && (!isBulk || checkedCompNos.size === 1)) updated.target_life_time = value;
                if (field === 'qty' && (!isBulk || checkedCompNos.size === 1)) updated.qty = value;

                if (field === 'status_penggantian') {
                    updated.status_penggantian = value;
                    updated.status = value === 'Belum Diganti' ? 'Belum' : 'Sudah';
                }
                if (field === 'hm_replace') updated.hm_replace = value;
                if (field === 'date_replace') updated.date_replace = value;
                if (field === 'brand_produk') updated.brand = value;
                if (field === 'description') updated.remarks = value;
                if (field === 'worn_out') updated.worn_out = value;
                if (field === 'inspection_date') updated.inspection_date = value;
                return updated;
            }
            return comp;
        }));
    };

    const formatNumberId = (val) => {
        if (val === null || val === undefined || val === '') return '0';
        const num = parseFloat(val);
        if (isNaN(num)) return val;
        return num.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    };


    const handleOpenCreateModal = () => {
        setModalMode('create');
        setEditingId(null);
        const defaultUnit = units && units.length > 0 ? units[0] : null;
        const defaultComp = initialUcComponents[0];
        setSelectedCompNo(1);
        setCheckedCompNos(new Set([1]));
        setUcComponents(initialUcComponents);
        setSearchUcComp('');

        setFormData({
            unit_id: defaultUnit ? defaultUnit.id : '',
            component: activeTab === 'wheel' ? 'Front Wheel' : 'ENGINE',
            part_number: '',
            description: '',
            target_life_time: activeTab === 'wheel' ? 18000 : 14000,
            hm_current: defaultUnit?.hm || 0,
            hm_replace: 0,
            date_replace: '',
            brand_produk: '',
            status_penggantian: 'Sudah Diganti',
        });
        setFormErrors({});
        setShowPlanModal(true);
    };

    const handleOpenCreateModalForUnit = (item) => {
        setModalMode('create');
        setEditingId(null);
        const unitObj = units?.find(u => u.code_unit === item.code_unit || u.id === item.unit_id);
        const matchedComp = initialUcComponents.find(c => c.name.toLowerCase() === (item.component || '').toLowerCase()) || initialUcComponents[0];
        
        setSelectedCompNo(matchedComp.no);
        setCheckedCompNos(new Set([matchedComp.no]));
        setUcComponents(initialUcComponents);
        setSearchUcComp('');

        setFormData({
            unit_id: unitObj ? unitObj.id : (item.unit_id || ''),
            component: item.component || 'ENGINE',
            part_number: item.part_number || '',
            description: item.description || '',
            target_life_time: item.target_life_time || (activeTab === 'wheel' ? 18000 : 14000),
            hm_current: item.hm_current || unitObj?.hm || 0,
            hm_replace: item.hm_replace || 0,
            date_replace: item.date_replace ? item.date_replace.split('T')[0] : '',
            brand_produk: item.brand_produk || '',
            status_penggantian: (item.hm_replace > 0 || item.date_replace) ? 'Sudah Diganti' : 'Belum Diganti',
            component: matchedComp.name,
            part_number: (item.part_number || matchedComp.part_number),
            description: item.description || '',
            target_life_time: item.target_life_time || 3000,
            hm_current: item.hm_current || unitObj?.hm || 0,
            hm_replace: item.hm_replace || 0,
            date_replace: item.date_replace ? item.date_replace.split('T')[0] : '',
            brand_produk: item.brand_produk || '',
            status_penggantian: (item.hm_replace > 0 || item.date_replace) ? 'Sudah Diganti' : 'Belum Diganti',
        });
        setFormErrors({});
        setShowPlanModal(true);
    };

    const handleOpenUcModalForUnit = (unitItem, targetCompName = null) => {
        setModalMode('edit');
        const unitObj = units?.find(u => u.code_unit === unitItem.code_unit || u.id === unitItem.unit_id);
        const unitCode = unitItem.code_unit;

        // Find all components for this unit from the loaded data for the current tab
        const unitComps = (data || []).filter(d => 
            (d.code_unit === unitCode || d.unit_id === unitItem.unit_id) && 
            isUndercarriageItem(d)
        );

        const mappedUcComponents = initialUcComponents.map((initialComp) => {
            const found = unitComps.find(c => c.component?.toLowerCase() === initialComp.name.toLowerCase() || c.part_number === initialComp.part_number);
            if (found) {
                const isReplaced = (found.hm_replace > 0 || found.date_replace);
                return {
                    no: initialComp.no,
                    id: found.id,
                    part_number: found.part_number || initialComp.part_number,
                    name: found.component || initialComp.name,
                    status: isReplaced ? 'Sudah' : 'Belum',
                    status_penggantian: isReplaced ? 'Sudah Diganti' : 'Belum Diganti',
                    target_life_time: found.target_life_time || initialComp.target_life_time,
                    hm_replace: found.hm_replace || 0,
                    date_replace: found.date_replace ? found.date_replace.split('T')[0] : '',
                    brand: found.brand_produk || '',
                    remarks: found.description || '',
                };
            }
            return {
                ...initialComp,
                id: null
            };
        });

        const activeComp = targetCompName 
            ? (mappedUcComponents.find(c => c.name.toLowerCase() === targetCompName.toLowerCase()) || mappedUcComponents[0])
            : mappedUcComponents[0];

        setSelectedCompNo(activeComp.no);
        setCheckedCompNos(new Set([activeComp.no]));
        setUcComponents(mappedUcComponents);
        setSearchUcComp('');

        setEditingId(activeComp.id || null);
        setFormData({
            unit_id: unitItem.unit_id || unitObj?.id || '',
            component: activeComp.name,
            part_number: activeComp.part_number,
            description: activeComp.remarks || '',
            target_life_time: activeComp.target_life_time || 3000,
            hm_current: unitItem.hm_current || unitObj?.hm || 0,
            hm_replace: activeComp.hm_replace || 0,
            date_replace: activeComp.date_replace || '',
            brand_produk: activeComp.brand || '',
            status_penggantian: activeComp.status_penggantian || 'Belum Diganti',
        });
        setFormErrors({});
        setShowPlanModal(true);
    };

    const handleOpenEditModal = (item) => {
        handleOpenUcModalForUnit(item, item.component);
    };

    const handleUnitChange = (unitId) => {
        const selected = units.find(u => u.id === unitId);
        setFormData(prev => ({
            ...prev,
            unit_id: unitId,
            hm_current: selected?.hm !== undefined ? selected.hm : prev.hm_current
        }));
    };

    const handleSavePlan = (e) => {
        e.preventDefault();
        setIsSaving(true);
        setFormErrors({});

        if (checkedCompNos.size > 1) {
            // Bulk Save Mode
            const bulkData = {
                unit_id: formData.unit_id,
                hm_current: formData.hm_current,
                components: ucComponents.filter(c => checkedCompNos.has(c.no))
            };
            
            router.post('/pcr-uc/bulk-store', bulkData, {
                preserveScroll: true,
                onSuccess: () => {
                    setShowPlanModal(false);
                    setIsSaving(false);
                },
                onError: (errors) => {
                    setFormErrors(errors);
                    setIsSaving(false);
                },
                onFinish: () => {
                    setIsSaving(false);
                }
            });
        } else if (modalMode === 'create' || !editingId) {
            router.post('/pcr-uc', formData, {
                preserveScroll: true,
                onSuccess: () => {
                    setShowPlanModal(false);
                    setIsSaving(false);
                },
                onError: (errors) => {
                    setFormErrors(errors);
                    setIsSaving(false);
                },
                onFinish: () => {
                    setIsSaving(false);
                }
            });
        } else {
            router.put(`/pcr-uc/${editingId}`, formData, {
                preserveScroll: true,
                onSuccess: () => {
                    setShowPlanModal(false);
                    setIsSaving(false);
                },
                onError: (errors) => {
                    setFormErrors(errors);
                    setIsSaving(false);
                },
                onFinish: () => {
                    setIsSaving(false);
                }
            });
        }
    };

    const handleImportFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        const reader = new FileReader();
        reader.onload = (uploadEvent) => {
            const base64Data = uploadEvent.target.result;
            router.post('/pcr-uc/import', {
                file_base64: base64Data,
                file_name: file.name
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsImporting(false);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                },
                onError: () => {
                    setIsImporting(false);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                },
                onFinish: () => {
                    setIsImporting(false);
                }
            });
        };
        reader.readAsDataURL(file);
    };

    const handleDeleteAll = () => {
        setIsDeletingAll(true);
        router.delete('/pcr-uc/destroy-all', {
            preserveScroll: true,
            onSuccess: () => {
                setShowDeleteAllModal(false);
                setIsDeletingAll(false);
                setSelectedPcr(null);
            },
            onError: () => {
                setIsDeletingAll(false);
            },
            onFinish: () => {
                setIsDeletingAll(false);
            }
        });
    };

    const handleDeleteSingle = (item) => {
        if (confirm(`Apakah Anda yakin ingin menghapus data PCR untuk unit ${item.code_unit} - ${item.component}?`)) {
            router.delete(`/pcr-uc/${item.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    if (selectedPcr?.id === item.id) {
                        setSelectedPcr(null);
                    }
                }
            });
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'ON SCHEDULE':
                return (
                    <span className="px-3 py-1 rounded bg-[#10b981] text-white font-bold text-xs uppercase tracking-wide">
                        On Schedule
                    </span>
                );
            case 'DUE SOON':
                return (
                    <span className="px-3 py-1 rounded bg-[#facc15] text-white font-bold text-xs uppercase tracking-wide">
                        Due Soon
                    </span>
                );
            case 'OVERDUE':
                return (
                    <span className="px-3 py-1 rounded bg-[#ef4444] text-white font-bold text-xs uppercase tracking-wide">
                        Overdue
                    </span>
                );
            default:
                return (
                    <span className="px-3 py-1 rounded bg-gray-500 text-white font-bold text-xs uppercase tracking-wide">
                        {status}
                    </span>
                );
        }
    };



    const uniqueModels = Array.from(new Set((data || []).map(i => i.model).filter(Boolean)));

    return (
        <AuthenticatedLayout>
            <Head title="PCR Undercarriage" />

            {/* Hidden Excel File Input */}
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImportFile} 
                accept=".xlsx,.xls,.csv" 
                className="hidden" 
            />

            <div className="mb-6 flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
                <div className="flex items-center gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">PCR Undercarriage</h1>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Monitoring dan perencanaan penggantian komponen Undercarriage berdasarkan interval hour meter</p>
                    </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                    <button 
                        type="button"
                        onClick={handleOpenCreateModal}
                        className="bg-[#10b981] hover:bg-[#059669] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition shadow-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        Tambah Plan
                    </button>
                    <button 
                        type="button"
                        disabled={isImporting}
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition shadow-sm disabled:opacity-50"
                    >
                        {isImporting ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                </svg>
                                Importing...
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                                Import Excel
                            </>
                        )}
                    </button>
                    <a href="/pcr-uc/template" className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition shadow-sm" title="Download Template Excel">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        Template
                    </a>
                    <a href="/pcr-uc/export" className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition shadow-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        Export Excel
                    </a>
                    <button onClick={() => window.print()} className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition shadow-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                        Print
                    </button>
                    <button 
                        type="button"
                        onClick={() => setShowDeleteAllModal(true)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition shadow-sm"
                        title="Hapus Seluruh Data PCR"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        Hapus Semua Data
                    </button>
                </div>
            </div>

            {/* Tab: Undercarriage only */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 p-1.5 flex flex-wrap sm:flex-nowrap gap-1">

                <button
                    type="button"
                    onClick={() => setActiveTab('uc')}
                    className={`flex-1 flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-lg font-bold text-sm sm:text-sm transition-all duration-200 ${
                        activeTab === 'uc'
                            ? 'bg-[#10b981] text-white shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    <span>Undercarriage</span>
                    <span className={`px-2 py-0.5 rounded-full text-sm font-bold ${
                        activeTab === 'uc' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
                    }`}>
                        {(data || []).filter(item => isUndercarriageItem(item)).length}
                    </span>
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl border border-gray-200/90 shadow-sm flex items-center gap-3.5 hover:shadow-md transition">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                    </div>
                    <div>
                        <div className="text-2xl font-black text-gray-900 leading-none">{activeStats.total}</div>
                        <div className="text-sm font-semibold text-gray-500 mt-1">Total Unit</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200/90 shadow-sm flex items-center gap-3.5 hover:shadow-md transition">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                    </div>
                    <div>
                        <div className="text-2xl font-black text-gray-900 leading-none">{activeStats.on_schedule}</div>
                        <div className="text-sm font-semibold text-gray-500 mt-1">Normal</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200/90 shadow-sm flex items-center gap-3.5 hover:shadow-md transition">
                    <div className="w-12 h-12 rounded-xl bg-amber-400 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
                    </div>
                    <div>
                        <div className="text-2xl font-black text-gray-900 leading-none">{activeStats.due_soon}</div>
                        <div className="text-sm font-semibold text-gray-500 mt-1">Due Soon</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200/90 shadow-sm flex items-center gap-3.5 hover:shadow-md transition">
                    <div className="w-12 h-12 rounded-xl bg-red-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                    </div>
                    <div>
                        <div className="text-2xl font-black text-gray-900 leading-none">{activeStats.overdue}</div>
                        <div className="text-sm font-semibold text-gray-500 mt-1">Overdue</div>
                    </div>
                </div>
            </div>

            {/* Filters Row & View Toggle */}
            <div className="bg-white p-3.5 rounded-xl border border-gray-200/90 shadow-sm mb-5">
                <form onSubmit={handleFilterSubmit} className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3 flex-1">
                        {/* Search Input */}
                        <div className="relative min-w-[220px] flex-1">
                            <input 
                                type="text"
                                placeholder="Search unit..."
                                value={searchFilter}
                                onChange={(e) => setSearchFilter(e.target.value)}
                                className="w-full text-sm border border-gray-300 text-gray-700 rounded-lg focus:ring-[#10b981] focus:border-[#10b981] px-3 py-2 pl-9"
                            />
                            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>

                        {/* Status Filter */}
                        <div className="min-w-[130px]">
                            <select 
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full text-sm border border-gray-300 text-gray-700 rounded-lg focus:ring-[#10b981] focus:border-[#10b981] px-3 py-2 bg-white"
                            >
                                <option value="">All Status</option>
                                <option value="ON SCHEDULE">Normal / On Schedule</option>
                                <option value="DUE SOON">Due Soon</option>
                                <option value="OVERDUE">Overdue</option>
                            </select>
                        </div>

                        {/* Model Filter */}
                        <div className="min-w-[130px]">
                            <select 
                                value={modelFilter}
                                onChange={(e) => setModelFilter(e.target.value)}
                                className="w-full text-sm border border-gray-300 text-gray-700 rounded-lg focus:ring-[#10b981] focus:border-[#10b981] px-3 py-2 bg-white"
                            >
                                <option value="">All Model</option>
                                {uniqueModels.map((m, idx) => (
                                    <option key={idx} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <button type="submit" className="bg-[#10b981] hover:bg-[#059669] text-white px-4 py-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-1 shadow-sm">
                                Cari
                            </button>
                            <button type="button" onClick={handleReset} className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm font-bold transition flex items-center justify-center shadow-sm" title="Reset filter">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                            </button>
                        </div>
                    </div>

                    {/* View Switcher (Grid / Table / History) */}
                    <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200">
                        <button
                            type="button"
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-md text-sm font-semibold flex items-center gap-1 transition ${
                                viewMode === 'grid' 
                                    ? 'bg-white text-gray-900 shadow-sm' 
                                    : 'text-gray-500 hover:text-gray-900'
                            }`}
                            title="Grid Card View"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M4 4h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 10h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 16h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4z"/></svg>
                            <span className="hidden sm:inline">Grid</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('table')}
                            className={`p-1.5 rounded-md text-sm font-semibold flex items-center gap-1 transition ${
                                viewMode === 'table' 
                                    ? 'bg-white text-gray-900 shadow-sm' 
                                    : 'text-gray-500 hover:text-gray-900'
                            }`}
                            title="Tabel View"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/></svg>
                            <span className="hidden sm:inline">Tabel</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('history')}
                            className={`p-1.5 rounded-md text-sm font-semibold flex items-center gap-1 transition ${
                                viewMode === 'history' 
                                    ? 'bg-white text-gray-900 shadow-sm' 
                                    : 'text-gray-500 hover:text-gray-900'
                            }`}
                            title="Riwayat Penggantian"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                            <span className="hidden sm:inline">Riwayat</span>
                        </button>
                    </div>
                </form>
            </div>

            {/* Content: Card Grid vs Table View */}
            {viewMode === 'grid' ? (
                <div>
                    {paginatedUnitGroups && paginatedUnitGroups.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                            {paginatedUnitGroups.map((unit) => {
                                const isSelected = selectedPcr?.code_unit === unit.code_unit;
                                const isOverdue = unit.worst_status === 'OVERDUE' || unit.min_sisa_hm < 0;
                                const isDueSoon = !isOverdue && (unit.worst_status === 'DUE SOON' || unit.min_sisa_hm <= 500);

                                let statusBadge = (
                                    <span className="bg-[#10b981] text-white text-xs font-extrabold px-2.5 py-0.5 rounded tracking-wider shadow-sm">
                                        NORMAL
                                    </span>
                                );
                                let progressColor = 'bg-[#10b981]';

                                if (isOverdue) {
                                    statusBadge = (
                                        <span className="bg-[#ef4444] text-white text-xs font-extrabold px-2.5 py-0.5 rounded tracking-wider shadow-sm">
                                            OVERDUE
                                        </span>
                                    );
                                    progressColor = 'bg-[#ef4444]';
                                } else if (isDueSoon) {
                                    statusBadge = (
                                        <span className="bg-[#facc15] text-amber-950 text-xs font-extrabold px-2.5 py-0.5 rounded tracking-wider shadow-sm">
                                            DUE SOON
                                        </span>
                                    );
                                    progressColor = 'bg-[#facc15]';
                                }

                                return (
                                    <div
                                        key={unit.code_unit}
                                        onClick={(e) => {
                                            if (!e.target.closest('button') && !e.target.closest('a')) {
                                                handleOpenUcModalForUnit(unit);
                                            }
                                        }}
                                        className={`bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                                            isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-gray-200/90 hover:border-emerald-300'
                                        }`}
                                    >
                                        {/* Card Top */}
                                        <div>
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative group/img w-20 h-16 bg-slate-50 border border-slate-200/90 rounded-xl p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                                                        <img 
                                                            src={getEquipmentImage(unit)} 
                                                            alt={unit.code_unit} 
                                                            className="w-full h-full object-contain group-hover/img:scale-105 transition-transform"
                                                            onError={(e) => { e.target.style.display = 'none'; }}
                                                        />
                                                        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-[1px] opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1 rounded-xl z-10">
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleOpenUcModalForUnit(unit);
                                                                }}
                                                                className="w-full py-0.5 px-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[9px] font-bold flex items-center justify-center gap-0.5 shadow-sm transition"
                                                                title="View Details"
                                                            >
                                                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                                                                View
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleOpenCreateModalForUnit(unit);
                                                                }}
                                                                className="w-full py-0.5 px-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[9px] font-bold flex items-center justify-center gap-0.5 shadow-sm transition"
                                                                title="Add Entry"
                                                            >
                                                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
                                                                + Entry
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <h4 className="font-black text-gray-900 text-sm sm:text-base leading-tight group-hover:text-emerald-600 transition-colors flex items-center gap-1.5 flex-wrap">
                                                            <span>{unit.code_unit}</span>
                                                            <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                                {unit.total_components} Comps
                                                            </span>
                                                        </h4>
                                                        <p className="text-sm font-semibold text-gray-400 mt-0.5">
                                                            {unit.model || (unit.code_unit?.startsWith('MD') ? 'KOMATSU D85ESS' : 'KOMATSU PC2000')}
                                                        </p>
                                                        <div className="flex items-center gap-1.5 mt-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleOpenUcModalForUnit(unit);
                                                                }}
                                                                className="px-2 py-0.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded text-xs font-bold flex items-center gap-1 border border-slate-200 transition"
                                                                title="View Components"
                                                            >
                                                                <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                                                                View ({unit.total_components})
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleOpenCreateModalForUnit(unit);
                                                                }}
                                                                className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded text-xs font-bold flex items-center gap-1 border border-emerald-200 transition"
                                                                title="Add new PCR entry"
                                                            >
                                                                <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                                                                + Add Entry
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="shrink-0">
                                                    {statusBadge}
                                                </div>
                                            </div>

                                            {/* Metrics Row */}
                                            <div className="space-y-1 text-sm bg-slate-50/70 rounded-lg p-2.5 mb-3 border border-slate-100 font-sans">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-500 font-medium">Current HM</span>
                                                    <span className="font-mono font-bold text-gray-900">{Number(unit.hm_current || 0).toLocaleString('id-ID')}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-500 font-medium">Status Komponen</span>
                                                    <span className="font-mono text-xs font-bold">
                                                        <span className="text-emerald-600">{unit.normal_count} Normal</span>, <span className="text-red-600">{unit.overdue_count} Overdue</span>
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-500 font-medium">Komponen Terkritis</span>
                                                    <span className="font-mono text-xs font-semibold text-gray-700 truncate max-w-[130px]">{unit.worst_comp?.component || '-'}</span>
                                                </div>
                                            </div>

                                            {/* Progress Bar & Percentage */}
                                            <div className="flex items-center gap-2.5 mb-3">
                                                <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full rounded-full transition-all duration-300 ${progressColor}`}
                                                        style={{ width: `${Math.min(unit.progress_pct, 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-bold text-gray-700 min-w-[36px] text-right font-mono">
                                                    {unit.progress_pct}%
                                                </span>
                                            </div>
                                        </div>

                                        {/* Card Footer: Remaining HM */}
                                        <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 mt-1">
                                            <div className={`text-sm font-bold ${isOverdue ? 'text-red-600' : 'text-emerald-700'}`}>
                                                {isOverdue 
                                                    ? `-${Math.abs(unit.min_sisa_hm).toLocaleString('id-ID')} HM (Overdue)` 
                                                    : `${Number(unit.min_sisa_hm).toLocaleString('id-ID')} HM remaining`}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400 mb-6">
                            Tidak ada data unit yang sesuai dengan filter.
                        </div>
                    )}
                </div>
            ) : (
                /* Table View */
                <div className="bg-white shadow-sm sm:rounded-xl overflow-hidden border border-gray-200/90 mb-4">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left whitespace-nowrap">
                            <thead>
                                <tr className="bg-gray-800 text-white">
                                    <th rowSpan={2} className="px-3 py-3 font-bold text-center border border-gray-600 w-10">NO</th>
                                    <th rowSpan={2} className="px-3 py-3 font-bold text-center border border-gray-600">UNIT</th>
                                    <th rowSpan={2} className="px-3 py-3 font-bold text-center border border-gray-600">MODEL</th>
                                    <th rowSpan={2} className="px-3 py-3 font-bold text-center border border-gray-600">
                                        COMPONENT
                                        <span title="Klik baris untuk melihat detail komponen" className="ml-1 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border border-gray-400 text-gray-300 text-[9px] cursor-help">?</span>
                                    </th>
                                    <th rowSpan={2} className="px-3 py-3 font-bold text-center border border-gray-600 min-w-[80px]">TARGET LIFETIME<br/>(HRS)</th>
                                    <th rowSpan={2} className="px-3 py-3 font-bold text-center border border-gray-600">CURRENT HM</th>
                                    <th rowSpan={2} className="px-3 py-3 font-bold text-center border border-gray-600">DATE PLAN</th>
                                    <th rowSpan={2} className="px-3 py-3 font-bold text-center border border-gray-600">REMAIN</th>
                                    <th colSpan={5} className="px-3 py-2 font-bold text-center border border-gray-600 bg-gray-700">LAST CHANGE OUT</th>
                                </tr>
                                <tr className="bg-gray-700 text-white">
                                    <th className="px-3 py-2 font-bold text-center border border-gray-600">LAST DATE</th>
                                    <th className="px-3 py-2 font-bold text-center border border-gray-600">LAST HM</th>
                                    <th className="px-3 py-2 font-bold text-center border border-gray-600">BRAND PART</th>
                                    <th className="px-3 py-2 font-bold text-center border border-gray-600">REMARKS PART</th>
                                    <th className="px-3 py-2 font-bold text-center border border-gray-600">ACTION</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-gray-700 bg-white">
                                {paginatedData && paginatedData.length > 0 ? (
                                    paginatedData.map((item, index) => {
                                        const isSelected = selectedPcr?.id === item.id;
                                        return (
                                            <tr 
                                                key={item.id} 
                                                onClick={(e) => {
                                                    if (!e.target.closest('button') && !e.target.closest('a')) {
                                                        setSelectedPcr(item);
                                                        handleOpenEditModal(item);
                                                    }
                                                }}
                                                className={`transition-colors cursor-pointer ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                                            >
                                                <td className="px-3 py-2.5 text-center text-gray-500">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                                <td className="px-3 py-2.5 text-center font-bold text-gray-900">{item.code_unit}</td>
                                                <td className="px-3 py-2.5 text-center text-gray-700 font-medium">{item.model || '-'}</td>
                                                <td className="px-3 py-2.5 text-center text-gray-700 font-medium">{item.component}</td>
                                                <td className="px-3 py-2.5 text-center font-mono text-gray-800">{item.target_life_time_formatted || Number(item.target_life_time)?.toLocaleString('id-ID')}</td>
                                                <td className="px-3 py-2.5 text-center font-mono text-gray-800">{item.hm_current_formatted || Number(item.hm_current)?.toLocaleString('id-ID')}</td>
                                                <td className="px-3 py-2.5 text-center text-gray-600">{item.target_tanggal || '-'}</td>
                                                <td className={`px-3 py-2.5 text-center font-mono font-bold ${item.sisa_hm < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                    {item.sisa_hm?.toLocaleString('id-ID')}
                                                </td>
                                                {/* LAST CHANGE OUT columns */}
                                                <td className="px-3 py-2.5 text-center text-gray-500 border-l border-gray-200">{item.date_replace ? new Date(item.date_replace).toLocaleDateString('id-ID') : '-'}</td>
                                                <td className="px-3 py-2.5 text-center font-mono text-gray-500">{item.hm_replace_formatted || (item.hm_replace ? Number(item.hm_replace).toLocaleString('id-ID') : '-')}</td>
                                                <td className="px-3 py-2.5 text-center text-gray-500">{item.brand_produk || '-'}</td>
                                                <td className="px-3 py-2.5 text-center text-gray-500">{item.description || '-'}</td>
                                                <td className="px-3 py-2.5 text-center">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <button className="bg-blue-500 hover:bg-blue-600 text-white p-1.5 rounded transition shadow-sm" title="Detail" onClick={(e) => { e.stopPropagation(); setSelectedPcr(item); }}>
                                                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                                                        </button>
                                                        <button 
                                                            className="bg-amber-400 hover:bg-amber-500 text-white p-1.5 rounded transition shadow-sm" 
                                                            title="Edit" 
                                                            onClick={(e) => { e.stopPropagation(); handleOpenEditModal(item); }}
                                                        >
                                                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                                                        </button>
                                                        <button 
                                                            className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded transition shadow-sm" 
                                                            title="Delete" 
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteSingle(item); }}
                                                        >
                                                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="13" className="px-6 py-8 text-center text-gray-400">
                                            Tidak ada data komponen PCR untuk tab {activeTab === 'wheel' ? 'Wheel Component' : 'Track Component'}.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* History View: Riwayat Penggantian */}
            {viewMode === 'history' && (
                <div className="mb-6">
                    <div className="bg-white rounded-xl border border-gray-200/90 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-sm">Riwayat Penggantian Komponen</h3>
                                    <p className="text-sm text-gray-500">Histori siklus penggantian {activeTab === 'wheel' ? 'Wheel Component' : 'Track Component'}</p>
                                </div>
                            </div>
                            <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-sm font-bold">
                                {tabFilteredData.filter(d => (d.replacement_history || []).length > 0).length} Komponen
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-4 py-3 text-left font-semibold text-gray-600 w-8">#</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-600">Unit</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-600">Komponen</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-600">Part Number</th>
                                        <th className="px-4 py-3 text-center font-semibold text-gray-600">Qty</th>
                                        <th className="px-4 py-3 text-center font-semibold text-gray-600">Siklus</th>
                                        <th className="px-4 py-3 text-right font-semibold text-gray-600">HM Ganti</th>
                                        <th className="px-4 py-3 text-center font-semibold text-gray-600">Tanggal</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-600">Brand</th>
                                        <th className="px-4 py-3 text-right font-semibold text-gray-600">Next Plant (HM)</th>
                                        <th className="px-4 py-3 text-center font-semibold text-gray-600">Target Life</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {(() => {
                                        const rows = [];
                                        let rowIdx = 0;
                                        tabFilteredData.forEach(item => {
                                            const hist = Array.isArray(item.replacement_history) ? item.replacement_history : [];
                                            if (hist.length === 0) return;
                                            hist.forEach((h, hIdx) => {
                                                rowIdx++;
                                                const isLatest = hIdx === hist.length - 1;
                                                rows.push(
                                                    <tr key={`${item.id}-${hIdx}`} className={`hover:bg-amber-50/30 transition ${isLatest ? 'bg-emerald-50/40' : ''}`}>
                                                        <td className="px-4 py-2.5 text-gray-400 font-medium">{rowIdx}</td>
                                                        <td className="px-4 py-2.5">
                                                            <span className="font-bold text-gray-900">{item.code_unit}</span>
                                                            {hIdx === 0 && (
                                                                <span className="ml-2 inline-block px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-bold">{hist.length}x</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-2.5">
                                                            <span className="font-semibold text-gray-800">{item.component}</span>
                                                            {isLatest && (
                                                                <span className="ml-1.5 inline-block px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 text-xs font-bold">Terkini</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-2.5 text-gray-500 font-mono text-sm">{item.part_number || '-'}</td>
                                                        <td className="px-4 py-2.5 text-center font-bold text-gray-700">{item.qty || 1}</td>
                                                        <td className="px-4 py-2.5 text-center">
                                                            <span className="w-6 h-6 rounded-full bg-gray-100 border border-gray-200 text-gray-600 font-bold text-sm inline-flex items-center justify-center">
                                                                {hIdx + 1}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-2.5 text-right">
                                                            <span className="font-bold text-gray-900">{h.hm_replace ? Number(h.hm_replace).toLocaleString('id-ID') : '-'}</span>
                                                            <span className="text-gray-400 ml-0.5">HM</span>
                                                        </td>
                                                        <td className="px-4 py-2.5 text-center text-gray-600">
                                                            {h.date_replace ? new Date(h.date_replace).toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' }) : '-'}
                                                        </td>
                                                        <td className="px-4 py-2.5">
                                                            <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-semibold">{h.brand_produk || '-'}</span>
                                                        </td>
                                                        <td className="px-4 py-2.5 text-right font-semibold text-blue-700">
                                                            {h.next_plant ? Number(h.next_plant).toLocaleString('id-ID') : '-'}
                                                        </td>
                                                        <td className="px-4 py-2.5 text-center">
                                                            <span className="text-gray-600">{item.target_life_time ? Number(item.target_life_time).toLocaleString('id-ID') : '-'} HM</span>
                                                        </td>
                                                    </tr>
                                                );
                                            });
                                        });
                                        if (rows.length === 0) {
                                            return (
                                                <tr>
                                                    <td colSpan="11" className="px-6 py-12 text-center">
                                                        <div className="flex flex-col items-center gap-3">
                                                            <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                                            </svg>
                                                            <p className="text-gray-400 font-medium">Belum ada riwayat penggantian</p>
                                                            <p className="text-gray-300 text-sm">Riwayat akan muncul setelah komponen pertama kali diganti</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        }
                                        return rows;
                                    })()}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Pagination Toolbar for Grid and Table modes */}
            {viewMode !== 'history' && (
                <div className="px-4 py-3 border border-gray-200/90 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-3 bg-white text-sm mb-6 shadow-sm">
                    <div className="text-gray-500">
                        Menampilkan {activeListLength > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, activeListLength)} dari {activeListLength} {isGrid ? 'unit' : 'data'} ({activeTab === 'wheel' ? 'Wheel Component' : 'Track Component'})
                    </div>
                    {totalPages > 1 && (
                        <div className="flex gap-1 items-center">
                            <button 
                                type="button"
                                onClick={() => setCurrentPage(1)} 
                                disabled={currentPage === 1}
                                className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                                title="First Page"
                            >
                                «
                            </button>
                            <button 
                                type="button"
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                                disabled={currentPage === 1}
                                className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                                title="Previous Page"
                            >
                                ‹
                            </button>
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let p = currentPage;
                                if (totalPages <= 5) p = i + 1;
                                else if (currentPage <= 3) p = i + 1;
                                else if (currentPage >= totalPages - 2) p = totalPages - 4 + i;
                                else p = currentPage - 2 + i;

                                return (
                                    <button 
                                        key={p} 
                                        type="button"
                                        onClick={() => setCurrentPage(p)}
                                        className={`w-7 h-7 flex items-center justify-center rounded border text-sm font-bold transition ${
                                            currentPage === p 
                                                ? 'bg-[#10b981] text-white border-[#10b981]' 
                                                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        {p}
                                    </button>
                                );
                            })}
                            <button 
                                type="button"
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                                disabled={currentPage === totalPages}
                                className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                                title="Next Page"
                            >
                                ›
                            </button>
                            <button 
                                type="button"
                                onClick={() => setCurrentPage(totalPages)} 
                                disabled={currentPage === totalPages}
                                className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                                title="Last Page"
                            >
                                »
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Bottom Panels (Detail, Riwayat, Next Schedule) */}
            {selectedPcr && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Detail Komponen */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-800 text-sm mb-4">Detail Komponen</h3>
                        <div className="flex flex-col sm:flex-row gap-4 items-start">
                            <div className="w-full sm:w-1/3 bg-gray-50 rounded-lg p-2 border border-gray-100 flex justify-center items-center h-32">
                                <svg className="w-20 h-20 text-yellow-500" fill="currentColor" viewBox="0 0 64 64">
                                    <path d="M54 36c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm-42 0c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm36-8H16v-8l6-6h18v14zm-22-6v-6h-4l-4 4v2h8zm12 0v-6h-4v6h4z" />
                                    <path d="M58 20H42v-2c0-1.1-.9-2-2-2H20.8L12 24.8V28H6c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h2c0 3.3 2.7 6 6 6s6-2.7 6-6h24c0 3.3 2.7 6 6 6s6-2.7 6-6h2c1.1 0 2-.9 2-2V22c0-1.1-.9-2-2-2z" opacity="0.3"/>
                                </svg>
                            </div>
                            <div className="w-full sm:w-2/3">
                                <table className="w-full text-sm text-gray-600">
                                    <tbody>
                                        <tr><td className="py-0.5 w-24">Kode Unit</td><td className="py-0.5 font-bold text-gray-900">: {selectedPcr.code_unit}</td></tr>
                                        <tr><td className="py-0.5">Equipment</td><td className="py-0.5">: {selectedPcr.equipment || '-'}</td></tr>
                                        <tr><td className="py-0.5">Model</td><td className="py-0.5">: {selectedPcr.model || '-'}</td></tr>
                                        <tr><td className="py-0.5">Serial Number</td><td className="py-0.5">: {selectedPcr.serial_number}</td></tr>
                                        <tr><td className="py-0.5">Component</td><td className="py-0.5 font-bold">: {selectedPcr.component}</td></tr>
                                        <tr><td className="py-0.5">Interval (HM)</td><td className="py-0.5">: {selectedPcr.target_life_time_formatted || selectedPcr.target_life_time}</td></tr>
                                        <tr><td className="py-0.5">HM Terakhir</td><td className="py-0.5">: {selectedPcr.hm_current_formatted || selectedPcr.hm_current}</td></tr>
                                        <tr><td className="py-0.5">Next Due (HM)</td><td className="py-0.5">: {selectedPcr.next_plant_formatted || selectedPcr.next_plant}</td></tr>
                                        <tr><td className="py-0.5">Sisa HM</td><td className="py-0.5">: {selectedPcr.sisa_hm?.toLocaleString('id-ID')}</td></tr>
                                        <tr><td className="py-0.5">Target Tanggal</td><td className="py-0.5">: {selectedPcr.target_tanggal}</td></tr>
                                        <tr><td className="py-0.5">Status</td><td className="py-0.5 flex items-center gap-1 mt-1">: {getStatusBadge(selectedPcr.status)}</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Riwayat Penggantian Komponen */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-800 text-sm mb-4">Riwayat Penggantian Komponen</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
                                    <tr>
                                        <th className="px-2 py-2 font-semibold">Tanggal</th>
                                        <th className="px-2 py-2 font-semibold">HM</th>
                                        <th className="px-2 py-2 font-semibold">Component</th>
                                        <th className="px-2 py-2 font-semibold">Part Number</th>
                                        <th className="px-2 py-2 font-semibold">PIC</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-gray-600">
                                    {[
                                        { tgl: selectedPcr.date_replace ? new Date(selectedPcr.date_replace).toLocaleDateString('id-ID') : '15 Jan 2025', hm: selectedPcr.hm_replace_formatted || '0', comp: selectedPcr.component, pn: selectedPcr.part_number, pic: 'Andi' },
                                        { tgl: '12 Jun 2023', hm: '4,000', comp: 'Hydraulic Pump', pn: '708-2L-00450', pic: 'Budi' },
                                        { tgl: '18 Nov 2021', hm: '8,000', comp: selectedPcr.component, pn: selectedPcr.part_number, pic: 'Rudi' },
                                        { tgl: '10 May 2020', hm: '4,000', comp: 'Travel Motor', pn: '21N-60-34100', pic: 'Slamet' },
                                        { tgl: '15 Feb 2019', hm: '0', comp: selectedPcr.component, pn: selectedPcr.part_number, pic: 'Anton' },
                                    ].map((row, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-2 py-2">{row.tgl}</td>
                                            <td className="px-2 py-2 font-mono">{row.hm}</td>
                                            <td className="px-2 py-2">{row.comp}</td>
                                            <td className="px-2 py-2">{row.pn}</td>
                                            <td className="px-2 py-2">{row.pic}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Jadwal Berikutnya (Berdasarkan Interval) */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-800 text-sm mb-4">Jadwal Berikutnya (Berdasarkan Interval)</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
                                    <tr>
                                        <th className="px-2 py-2 font-semibold">Component</th>
                                        <th className="px-2 py-2 font-semibold">Interval (HM)</th>
                                        <th className="px-2 py-2 font-semibold">Next Due (HM)</th>
                                        <th className="px-2 py-2 font-semibold">Target Tanggal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-gray-600">
                                    {[
                                        { comp: selectedPcr.component, int: selectedPcr.target_life_time_formatted || selectedPcr.target_life_time, next: selectedPcr.next_plant_formatted || selectedPcr.next_plant, tgl: selectedPcr.target_tanggal },
                                        { comp: 'Hydraulic Pump', int: '4,000', next: '4,000', tgl: '05 Sep 2026' },
                                        { comp: 'Swing Bearing', int: '8,000', next: '8,000', tgl: '01 Sep 2026' },
                                        { comp: 'Final Drive', int: '6,000', next: '6,000', tgl: '18 Sep 2026' },
                                        { comp: 'Travel Motor', int: '4,000', next: '4,000', tgl: '12 Sep 2026' },
                                    ].map((row, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-2 py-2">{row.comp}</td>
                                            <td className="px-2 py-2 font-mono">{row.int}</td>
                                            <td className="px-2 py-2 font-mono font-bold text-blue-600">{row.next}</td>
                                            <td className="px-2 py-2">{row.tgl}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Tambah / Edit Plan Component */}
            {showPlanModal && (
                <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm animate-fadeIn flex justify-center items-center p-3">
                    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 transform transition-all flex flex-col" style={{width:'95vw', height:'95vh', maxWidth:'1600px', overflow:'hidden'}}>
                            <div className="flex justify-between items-start pb-4 border-b border-gray-100 mb-0 px-6 pt-5 shrink-0">
                                <div className="flex items-center gap-3">
                                    <span className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 shadow-sm">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </span>
                                    <div>
                                        <h3 className="text-xl font-extrabold text-gray-900 leading-tight">
                                            {modalMode === 'create' ? 'Tambah Plan PCR Undercarriage' : 'Edit Plan PCR Undercarriage'}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-0.5">
                                            Pilih komponen dan perbarui status penggantian
                                        </p>
                                    </div>
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => setShowPlanModal(false)}
                                    className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </div>

                            <form id="plan-pcr-form" onSubmit={handleSavePlan} className="flex-1 overflow-y-auto px-6 pb-4 pt-4">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                                    {/* Left Column: Daftar Komponen */}
                                    <div className="lg:col-span-5 flex flex-col justify-between h-full">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-semibold text-gray-900">Plan PCR Component</span>
                                                <h4 className="font-bold text-gray-900 text-sm">
                                                    Daftar Komponen Undercarriage
                                                </h4>
                                                <span className="px-2.5 py-0.5 rounded-full text-sm font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    {ucComponents.length} Komponen
                                                </span>
                                            </div>

                                            {/* Search Component Input */}
                                            <div className="relative mb-2.5">
                                                <input 
                                                    type="text"
                                                    placeholder="Cari part number / nama komponen..."
                                                    value={searchUcComp}
                                                    onChange={(e) => setSearchUcComp(e.target.value)}
                                                    className="w-full text-sm border border-gray-200 rounded-lg pl-8 pr-3 py-2 bg-gray-50/70 focus:bg-white text-gray-800 focus:ring-emerald-500 focus:border-emerald-500 transition"
                                                />
                                                <svg className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                            </div>

                                            {/* Table Container */}
                                            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                                                <div className="max-h-[480px] overflow-y-auto">
                                                    <table className="w-full text-left text-sm border-collapse">
                                                        <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200 sticky top-0 z-10 text-sm">
                                                            <tr>
                                                                <th className="px-2.5 py-2 w-8 text-center">
                                                                    <input 
                                                                        type="checkbox"
                                                                        checked={checkedCompNos.size === ucComponents.length && ucComponents.length > 0}
                                                                        onChange={handleSelectAllUc}
                                                                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                                                                    />
                                                                </th>
                                                                <th onClick={() => handleSortUc('no')} className="px-2 py-2 cursor-pointer hover:bg-gray-100 select-none">
                                                                    <div className="flex items-center gap-1">
                                                                        <span>No</span>
                                                                        <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M5 7l5-5 5 5H5zM5 13l5 5 5-5H5z"/></svg>
                                                                    </div>
                                                                </th>
                                                                <th onClick={() => handleSortUc('part_number')} className="px-2 py-2 cursor-pointer hover:bg-gray-100 select-none">
                                                                    <div className="flex items-center gap-1">
                                                                        <span>Part Number</span>
                                                                        <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M5 7l5-5 5 5H5zM5 13l5 5 5-5H5z"/></svg>
                                                                    </div>
                                                                </th>
                                                                <th onClick={() => handleSortUc('name')} className="px-2 py-2 cursor-pointer hover:bg-gray-100 select-none">
                                                                    <div className="flex items-center gap-1">
                                                                        <span>Component Name</span>
                                                                        <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M5 7l5-5 5 5H5zM5 13l5 5 5-5H5z"/></svg>
                                                                    </div>
                                                                </th>
                                                                <th onClick={() => handleSortUc('target_life_time')} className="px-2 py-2 text-right cursor-pointer hover:bg-gray-100 select-none">
                                                                    <div className="flex items-center justify-end gap-1">
                                                                        <span>Target Lifetime</span>
                                                                        <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M5 7l5-5 5 5H5zM5 13l5 5 5-5H5z"/></svg>
                                                                    </div>
                                                                </th>

                                                                <th onClick={() => handleSortUc('status')} className="px-2 py-2 text-center cursor-pointer hover:bg-gray-100 select-none">
                                                                    <div className="flex items-center justify-center gap-1">
                                                                        <span>Status</span>
                                                                        <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M5 7l5-5 5 5H5zM5 13l5 5 5-5H5z"/></svg>
                                                                    </div>
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-100 text-gray-700 text-sm">
                                                            {ucComponents
                                                                .filter(comp => {
                                                                    if (!searchUcComp) return true;
                                                                    const q = searchUcComp.toLowerCase();
                                                                    return comp.name.toLowerCase().includes(q) || comp.part_number.toLowerCase().includes(q);
                                                                })
                                                                .sort((a, b) => {
                                                                    let valA = a[sortConfig.key];
                                                                    let valB = b[sortConfig.key];
                                                                    if (typeof valA === 'string') {
                                                                        valA = valA.toLowerCase();
                                                                        valB = (valB || '').toLowerCase();
                                                                    }
                                                                    if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                                                                    if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                                                                    return 0;
                                                                })
                                                                .map((comp) => {
                                                                    const isSelected = selectedCompNo === comp.no;
                                                                    const isChecked = checkedCompNos.has(comp.no);
                                                                    const isSudah = comp.status === 'Sudah' || comp.status_penggantian === 'Sudah Diganti';

                                                                    return (
                                                                        <tr 
                                                                            key={comp.no}
                                                                            onClick={() => handleSelectUcComponent(comp)}
                                                                            className={`cursor-pointer transition-colors ${
                                                                                isSelected ? 'bg-emerald-50 text-emerald-950 font-bold' : 'hover:bg-gray-50'
                                                                            }`}
                                                                        >
                                                                            <td className="px-2.5 py-1.5 text-center" onClick={(e) => e.stopPropagation()}>
                                                                                <input 
                                                                                    type="checkbox"
                                                                                    checked={isChecked}
                                                                                    onChange={() => handleToggleCompCheck(comp.no)}
                                                                                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                                                                                />
                                                                            </td>
                                                                            <td className="px-2 py-1.5 text-gray-500 font-mono">{comp.no}</td>
                                                                            <td className="px-2 py-1.5 font-mono text-gray-800">{comp.part_number}</td>
                                                                            <td className="px-2 py-1.5">{comp.name}</td>
                                                                            <td className="px-2 py-1.5 text-right font-mono text-gray-600">
                                                                                {Number(comp.target_life_time || 0).toLocaleString('id-ID')} Jam
                                                                            </td>

                                                                            <td className="px-2 py-1.5 text-center">
                                                                                {isSudah ? (
                                                                                    <span className="px-2 py-0.5 rounded bg-[#10b981] text-white font-bold text-xs">
                                                                                        Sudah
                                                                                    </span>
                                                                                ) : (
                                                                                    <span className="px-2 py-0.5 rounded bg-red-100 text-red-600 font-bold text-xs">
                                                                                        Belum
                                                                                    </span>
                                                                                )}
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Bottom Left Actions */}
                                        <div className="flex items-center justify-between mt-3 pt-1">
                                            <button
                                                type="button"
                                                onClick={handleSelectAllUc}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-bold transition shadow-sm flex items-center gap-1.5 ${
                                                    checkedCompNos.size === ucComponents.length
                                                        ? 'bg-blue-600 text-white border border-blue-600 hover:bg-blue-700'
                                                        : 'border border-blue-300 text-blue-700 hover:bg-blue-50'
                                                }`}
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    {checkedCompNos.size === ucComponents.length
                                                        ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                        : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                    }
                                                </svg>
                                                {checkedCompNos.size === ucComponents.length ? 'Batal Semua' : 'Isi Semua Sekaligus'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleResetUcStatus}
                                                className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 flex items-center gap-1.5 transition shadow-sm"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                                Reset Status
                                            </button>
                                        </div>
                                    </div>

                                    {/* Right Column: Detail Komponen */}
                                    <div className="lg:col-span-7 flex flex-col justify-between h-full overflow-y-auto">
                                        <div className="space-y-1.5">
                                            {/* Bulk Mode Banner */}
                                            {checkedCompNos.size > 1 && (
                                                <div className="bg-blue-600 text-white rounded-lg px-3 py-2 flex items-start gap-2 mb-1">
                                                    <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                    </svg>
                                                    <div>
                                                        <div className="text-sm font-extrabold">Mode Isi Sekaligus — {checkedCompNos.size} Komponen Terpilih</div>
                                                        <div className="text-xs opacity-90 mt-0.5">Isi field di bawah sekali → otomatis berlaku untuk semua komponen yang dicentang.</div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Header */}
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                                                    <span className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </span>
                                                    Detail Komponen
                                                </h4>
                                            </div>

                                            {/* Unit Select */}
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-0.5">
                                                    Unit <span className="text-red-500">*</span>
                                                </label>
                                                <select 
                                                    required
                                                    value={formData.unit_id}
                                                    onChange={(e) => handleUnitChange(e.target.value)}
                                                    className="w-full text-sm border border-gray-300 rounded-lg py-1.5 px-2 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                                                >
                                                    <option value="">-- Pilih Unit --</option>
                                                    {units.filter(u => (u.code_unit || '').startsWith('MD') || (u.code_unit || '').startsWith('ME') || (u.type_unit === 'DOZER') || (u.type_unit === 'EXCAVATOR')).map((u) => (
                                                        <option key={u.id} value={u.id}>
                                                            {u.code_unit} - {u.model} {u.equipment_capacity ? `(${u.equipment_capacity})` : ''}
                                                        </option>
                                                    ))}
                                                </select>
                                                {formErrors.unit_id && <p className="text-sm text-red-500 mt-1">{formErrors.unit_id}</p>}
                                            </div>

                                            {/* Part Number & Nama Komponen (Hanya Tampil Jika Bukan Bulk Mode) */}
                                            {checkedCompNos.size <= 1 && (
                                                <div className="grid grid-cols-2 gap-2.5">
                                                    <div>
                                                        <label className="block text-sm font-bold text-gray-700 mb-0.5">
                                                            Part Number <span className="text-red-500">*</span>
                                                        </label>
                                                        <input 
                                                            type="text"
                                                            required
                                                            value={formData.part_number}
                                                            onChange={(e) => handleUcFormFieldChange('part_number', e.target.value)}
                                                            className="w-full text-sm border border-gray-300 bg-gray-50/70 rounded-lg py-1.5 px-2 text-gray-900 focus:bg-white focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                                                        />
                                                        {formErrors.part_number && <p className="text-xs text-red-500 mt-0.5">{formErrors.part_number}</p>}
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-bold text-gray-700 mb-0.5">
                                                            Nama Komponen <span className="text-red-500">*</span>
                                                        </label>
                                                        <input 
                                                            type="text"
                                                            required
                                                            value={formData.component}
                                                            onChange={(e) => handleUcFormFieldChange('component', e.target.value)}
                                                            className="w-full text-sm border border-gray-300 bg-gray-50/70 rounded-lg py-1.5 px-2 text-gray-900 focus:bg-white focus:ring-emerald-500 focus:border-emerald-500"
                                                        />
                                                        {formErrors.component && <p className="text-xs text-red-500 mt-0.5">{formErrors.component}</p>}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Status Penggantian Radio Box */}
                                            <div className={`rounded-lg py-1 px-2.5 border ${
                                                checkedCompNos.size > 1
                                                    ? 'bg-blue-50/70 border-blue-200'
                                                    : 'bg-emerald-50/60 border-emerald-100'
                                            }`}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <label className={`block text-sm font-bold ${
                                                        checkedCompNos.size > 1 ? 'text-blue-900' : 'text-emerald-950'
                                                    }`}>
                                                        Status Penggantian
                                                    </label>
                                                    {checkedCompNos.size > 1 && (
                                                        <span className="flex items-center gap-1 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            Update {checkedCompNos.size} Komponen
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-800 cursor-pointer">
                                                        <input 
                                                            type="radio"
                                                            name="status_penggantian"
                                                            value="Sudah Diganti"
                                                            checked={formData.status_penggantian === 'Sudah Diganti'}
                                                            onChange={(e) => handleUcFormFieldChange('status_penggantian', e.target.value)}
                                                            className="text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                                                        />
                                                        <span>Sudah Diganti</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-800 cursor-pointer">
                                                        <input 
                                                            type="radio"
                                                            name="status_penggantian"
                                                            value="Overhaul"
                                                            checked={formData.status_penggantian === 'Overhaul'}
                                                            onChange={(e) => handleUcFormFieldChange('status_penggantian', e.target.value)}
                                                            className="text-amber-500 focus:ring-amber-400 w-4 h-4 cursor-pointer"
                                                        />
                                                        <span>Overhaul</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                                                        <input 
                                                            type="radio"
                                                            name="status_penggantian"
                                                            value="Belum Diganti"
                                                            checked={formData.status_penggantian === 'Belum Diganti'}
                                                            onChange={(e) => handleUcFormFieldChange('status_penggantian', e.target.value)}
                                                            className="text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                                                        />
                                                        <span>Belum Diganti</span>
                                                    </label>
                                                </div>
                                            </div>

                                            {/* 2-Column Inputs */}
                                            <div className="grid grid-cols-2 gap-1.5">
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-0.5">
                                                        Target Life Time (Interval HM)
                                                    </label>
                                                    <input 
                                                        type="number"
                                                        min="0"
                                                        placeholder="6000"
                                                        value={formData.target_life_time}
                                                        onChange={(e) => handleUcFormFieldChange('target_life_time', e.target.value)}
                                                        className="w-full text-sm border border-gray-300 rounded-lg py-1.5 px-2 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-0.5">
                                                        Current HM Unit
                                                    </label>
                                                    <input 
                                                        type="text"
                                                        readOnly
                                                        value={formData.hm_current ? String(formData.hm_current).replace('.', ',') : '0'}
                                                        className="w-full text-sm border border-gray-300 rounded-lg py-1.5 px-2 bg-gray-100 cursor-not-allowed text-gray-500 font-semibold"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-0.5">
                                                        HM Terakhir Ganti
                                                    </label>
                                                    <input 
                                                        type="number"
                                                        min="0"
                                                        placeholder="0"
                                                        value={formData.hm_replace}
                                                        onChange={(e) => handleUcFormFieldChange('hm_replace', e.target.value)}
                                                        className="w-full text-sm border border-gray-300 rounded-lg py-1.5 px-2 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-0.5">
                                                        Tanggal Terakhir Ganti
                                                    </label>
                                                    <input 
                                                        type="date"
                                                        value={formData.date_replace || ''}
                                                        onChange={(e) => handleUcFormFieldChange('date_replace', e.target.value)}
                                                        className="w-full text-sm border border-gray-300 rounded-lg py-1.5 px-2 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-0.5">
                                                        Hasil Inspection (Worn Out) <span className="text-red-500">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <input 
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            placeholder="0"
                                                            value={formData.worn_out}
                                                            onChange={(e) => handleUcFormFieldChange('worn_out', e.target.value)}
                                                            className="w-full text-sm border border-gray-300 rounded-lg py-1.5 px-2 pr-7 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500"
                                                        />
                                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-bold">%</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-0.5">
                                                        Tanggal Inspection
                                                    </label>
                                                    <input 
                                                        type="date"
                                                        value={formData.inspection_date || ''}
                                                        onChange={(e) => handleUcFormFieldChange('inspection_date', e.target.value)}
                                                        className="w-full text-sm border border-gray-300 rounded-lg py-1.5 px-2 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500"
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="block text-sm font-bold text-gray-700 mb-0.5">
                                                        Brand / Merk Part
                                                    </label>
                                                    <input 
                                                        type="text"
                                                        placeholder="Contoh: OEM, Komatsu, CAT, Berco, ITM"
                                                        value={formData.brand_produk}
                                                        onChange={(e) => handleUcFormFieldChange('brand_produk', e.target.value)}
                                                        className="w-full text-sm border border-gray-300 rounded-lg py-1.5 px-2 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500"
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="block text-sm font-bold text-gray-700 mb-0.5">
                                                        Keterangan / Remarks
                                                    </label>
                                                    <input 
                                                        type="text"
                                                        placeholder="Contoh: Penggantian rutin standar"
                                                        value={formData.description}
                                                        onChange={(e) => handleUcFormFieldChange('description', e.target.value)}
                                                        className="w-full text-sm border border-gray-300 rounded-lg py-1.5 px-2 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500"
                                                    />
                                                </div>
                                            </div>

                                            {/* Dynamic Calculation Panel */}
                                            {(() => {
                                                const targetLife = Number(formData.target_life_time || 0);
                                                const currentHm = parseHm(formData.hm_current);
                                                const hmReplace = parseHm(formData.hm_replace);
                                                const wornOut = (formData.worn_out !== '' && formData.worn_out !== null && formData.worn_out !== undefined)
                                                    ? Math.min(100, Math.max(0, Number(formData.worn_out)))
                                                    : null;
                                                const remaining = wornOut !== null
                                                    ? targetLife * ((100 - wornOut) / 100)
                                                    : targetLife - (currentHm - hmReplace);
                                                const nextDue = wornOut !== null
                                                    ? currentHm + remaining
                                                    : (hmReplace > 0 ? hmReplace : currentHm) + targetLife;
                                                const wornPct = wornOut !== null ? wornOut : 0;
                                                const remainingPct = 100 - wornPct;
                                                const conditionColor = wornPct <= 30 ? '#10b981' : wornPct <= 70 ? '#f59e0b' : '#ef4444';
                                                const conditionLabel = wornPct <= 30 ? 'Baik' : wornPct <= 70 ? 'Perlu Perhatian' : 'Rekomendasi Penggantian';

                                                return (
                                                    <div className="mt-1">
                                                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-2">
                                                            <div className="flex items-center gap-1.5 mb-2">
                                                                <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                                </svg>
                                                                <span className="text-sm font-bold text-gray-700">Perhitungan Estimasi Next Replacement</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                                <div className="bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-center min-w-[70px]">
                                                                    <div className="text-[9px] text-gray-500 font-medium">Target Life Time</div>
                                                                    <div className="text-sm font-bold text-gray-800">{Number(targetLife).toLocaleString('id-ID')} HM</div>
                                                                </div>
                                                                <span className="text-gray-400 font-bold text-sm">+</span>
                                                                <div className="bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-center min-w-[70px]">
                                                                    <div className="text-[9px] text-gray-500 font-medium">Worn Out Inspection</div>
                                                                    <div className="text-sm font-bold text-red-500">{wornOut !== null ? wornOut : '—'}%</div>
                                                                </div>
                                                                <span className="text-gray-400 font-bold text-sm">+</span>
                                                                <div className="bg-white border border-emerald-200 rounded-lg px-2.5 py-1.5 text-center min-w-[80px]">
                                                                    <div className="text-[9px] text-gray-500 font-medium">Remaining Life</div>
                                                                    <div className="text-sm font-bold text-emerald-600">{formatNumberId(remaining)} HM</div>
                                                                    {wornOut !== null && <div className="text-[8px] text-gray-400">({100 - wornOut}% tersisa)</div>}
                                                                </div>
                                                                <span className="text-gray-400 font-bold text-sm">+</span>
                                                                <div className="bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-center min-w-[70px]">
                                                                    <div className="text-[9px] text-gray-500 font-medium">Current HM</div>
                                                                    <div className="text-sm font-bold text-gray-800">{formatNumberId(currentHm)} HM</div>
                                                                </div>
                                                                <span className="text-gray-400 font-bold text-sm">=</span>
                                                                <div className="bg-emerald-600 text-white rounded-lg px-3 py-1.5 text-center min-w-[85px] shadow-sm">
                                                                    <div className="text-[9px] font-medium opacity-80">Estimasi Next Due</div>
                                                                    <div className="text-sm font-extrabold">{formatNumberId(nextDue)} HM</div>
                                                                    <div className="text-[9px] opacity-80">Sisa: {formatNumberId(remaining)} HM</div>
                                                                </div>
                                                            </div>
                                                            <div className="mt-2 bg-blue-50 border border-blue-100 rounded-lg px-2.5 py-1.5">
                                                                <div className="flex items-start gap-1">
                                                                    <svg className="w-3 h-3 text-blue-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                                    </svg>
                                                                    <span className="text-[9px] text-blue-700">
                                                                        Rumus: Remaining Life = Target Life × (100% – Worn Out%)<br/>
                                                                        Next Due = Current HM + Remaining Life
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {wornOut !== null && (
                                                            <div className="mt-1.5 bg-white border border-gray-200 rounded-xl p-2">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <span className="text-sm font-bold text-gray-700">Kondisi Komponen</span>
                                                                    <span className="text-sm font-extrabold" style={{ color: conditionColor }}>{wornPct}%</span>
                                                                </div>
                                                                <div className="relative h-3 rounded-full overflow-hidden bg-gray-100 mb-2">
                                                                    <div className="absolute inset-0 flex">
                                                                        <div className="h-full bg-emerald-400" style={{ width: '30%' }} />
                                                                        <div className="h-full bg-amber-400" style={{ width: '40%' }} />
                                                                        <div className="h-full bg-red-400" style={{ width: '30%' }} />
                                                                    </div>
                                                                    <div 
                                                                        className="absolute top-0 bottom-0 w-1 bg-gray-900 rounded-full shadow-sm transition-all"
                                                                        style={{ left: `calc(${Math.min(wornPct, 99)}% - 2px)` }}
                                                                    />
                                                                </div>
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex flex-col gap-0.5">
                                                                        <span className="text-[9px] font-bold text-red-500">{wornPct}% Worn Out</span>
                                                                        <span className="text-[9px] font-bold text-emerald-600">{remainingPct}% Remaining</span>
                                                                    </div>
                                                                    <div className="flex flex-col gap-0.5 text-right">
                                                                        <div className="flex items-center gap-1 justify-end">
                                                                            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                                                                            <span className="text-[9px] text-gray-600">0–30% Baik</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-1 justify-end">
                                                                            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                                                                            <span className="text-[9px] text-gray-600">31–70% Perlu Perhatian</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-1 justify-end">
                                                                            <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                                                                            <span className="text-[9px] text-gray-600">71–100% Rekomendasi Penggantian</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="mt-2 text-center">
                                                                    <span 
                                                                        className="text-xs font-bold px-3 py-1 rounded-full text-white"
                                                                        style={{ backgroundColor: conditionColor }}
                                                                    >
                                                                        {conditionLabel}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })()}

                                            <p className="text-xs text-gray-400 italic">
                                                * Data akan tersimpan saat klik tombol "Perbarui Plan"
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </form>
                            {/* Pinned Footer Buttons */}
                            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
                                <button
                                    type="button"
                                    disabled={isSaving}
                                    onClick={() => setShowPlanModal(false)}
                                    className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    form="plan-pcr-form"
                                    disabled={isSaving}
                                    className="px-6 py-2.5 rounded-lg bg-[#10b981] hover:bg-[#059669] text-white text-sm font-bold transition shadow-sm flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                            </svg>
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                            </svg>
                                            ✓ Perbarui Plan
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            {/* Delete All Modal */}
            {showDeleteAllModal && (
                <div className="fixed inset-0 z-[60] overflow-y-auto flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 transform transition-all">
                        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        
                        <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
                            Hapus Semua Data PCR?
                        </h3>
                        
                        <p className="text-sm text-gray-500 text-center mb-6">
                            Apakah Anda yakin ingin menghapus <strong>seluruh ({allCount})</strong> data PCR beserta Work Order terkait? Tindakan ini bersifat permanen dan tidak dapat dibatalkan.
                        </p>

                        <div className="flex items-center justify-center gap-3">
                            <button
                                type="button"
                                disabled={isDeletingAll}
                                onClick={() => setShowDeleteAllModal(false)}
                                className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                disabled={isDeletingAll}
                                onClick={handleDeleteAll}
                                className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50"
                            >
                                {isDeletingAll ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                        </svg>
                                        Menghapus...
                                    </>
                                ) : (
                                    'Ya, Hapus Semua Data'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </AuthenticatedLayout>
    );
}

export default function Index(props) {
    return (
        <ErrorBoundary>
            <IndexContent {...props} />
        </ErrorBoundary>
    );
}



