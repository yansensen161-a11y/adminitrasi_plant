import React, { useState, useEffect, useRef, useCallback } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

// ─── Editable Plan Activity Cell ─────────────────────────────────────────────
function EditableTarget({ unitId, category, month, year, initialValue, onSave }) {
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState(initialValue ?? 0);
    const [saving, setSaving] = useState(false);
    const isSavingRef = useRef(false);
    const inputRef = useRef(null);

    useEffect(() => {
        setValue(initialValue ?? 0);
    }, [initialValue]);

    useEffect(() => {
        if (editing && inputRef.current) {
            inputRef.current.select();
        }
    }, [editing]);

    const save = async () => {
        if (isSavingRef.current) return;
        const numVal = Math.max(0, parseInt(value, 10) || 0);
        setEditing(false);
        setValue(numVal);

        // Optimistically update parent state so value never reverts or disappears
        if (onSave) {
            onSave(numVal);
        }

        // If value has not changed, skip network call
        if (numVal === (initialValue ?? 0)) {
            return;
        }

        isSavingRef.current = true;
        setSaving(true);
        try {
            await axios.post(route('plan-inspections.update-target'), {
                unit_id: unitId,
                category,
                month,
                year,
                target_value: numVal,
            });
        } catch (e) {
            console.error('Failed to save target', e);
            setValue(initialValue ?? 0);
            if (onSave) {
                onSave(initialValue ?? 0);
            }
            alert('Gagal menyimpan target Plan Activity.');
        } finally {
            setSaving(false);
            isSavingRef.current = false;
        }
    };

    if (editing) {
        return (
            <input
                ref={inputRef}
                type="number"
                min="0"
                className="w-11 text-center text-xs font-semibold border border-blue-500 rounded outline-none bg-blue-50 py-0 px-0.5 shadow-inner"
                value={value}
                onChange={e => setValue(e.target.value)}
                onBlur={save}
                onKeyDown={e => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        save();
                    } else if (e.key === 'Escape') {
                        setEditing(false);
                        setValue(initialValue ?? 0);
                    }
                }}
            />
        );
    }

    return (
        <span
            onClick={() => setEditing(true)}
            title="Klik untuk edit target Plan Activity"
            className={`cursor-pointer px-1 py-0.5 rounded hover:bg-blue-100 hover:text-blue-700 transition-colors font-semibold ${saving ? 'opacity-50' : ''}`}
        >
            {value}
            <span className="ml-0.5 text-gray-400 text-[9px]">✎</span>
        </span>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Index({
    auth,
    groupedUnits,
    allUnits = [],
    planData,
    targetData,
    currentMonth,
    currentYear,
    daysInMonth,
    unitTypes,
    fourShiftCategories = [],
    cleaningTrackCategories = [],
    nonGreasingCategories = [],
}) {
    const [activeTab, setActiveTab] = useState(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const tabParam = params.get('category') || params.get('tab');
            if (tabParam) return tabParam;
        }
        return 'inspection';
    });
    const [localPlanData, setLocalPlanData] = useState(planData);
    const [localTargetData, setLocalTargetData] = useState(targetData || {});

    // Sync state when props change from server (e.g. month/year navigation or Inertia reloads)
    useEffect(() => {
        setLocalPlanData(planData);
    }, [planData]);

    useEffect(() => {
        setLocalTargetData(targetData || {});
    }, [targetData]);

    const handleTargetUpdated = (unitId, category, newVal) => {
        setLocalTargetData(prev => ({
            ...prev,
            [unitId]: {
                ...(prev?.[unitId] || {}),
                [category]: newVal,
            },
        }));
    };

    const defaultFourShiftCategories = [
        'CRUSHER',
        'EXCAVATOR BIG DIGGER',
        'EXCAVATOR SMALL DIGGER',
        'BULLDOZER',
        'MOTOR GRADER',
        'CRANE TRUCK & LOWBOY',
    ];
    const activeFourShiftCats = (fourShiftCategories && fourShiftCategories.length > 0)
        ? fourShiftCategories
        : defaultFourShiftCategories;

    const is4ShiftCategory = (categoryName) => {
        if (!categoryName) return false;
        return activeFourShiftCats.some(c => c.toUpperCase() === categoryName.toUpperCase());
    };

    const defaultCleaningTrackCategories = [
        'CRUSHER',
        'EXCAVATOR BIG DIGGER',
        'EXCAVATOR SMALL DIGGER',
        'BULLDOZER',
    ];
    const activeCleaningTrackCats = (cleaningTrackCategories && cleaningTrackCategories.length > 0)
        ? cleaningTrackCategories
        : defaultCleaningTrackCategories;

    const isCleaningTrackCategory = (categoryName) => {
        if (!categoryName) return false;
        return activeCleaningTrackCats.some(c => c.toUpperCase() === categoryName.trim().toUpperCase());
    };

    const defaultNonGreasingCategories = [
        'DEWATERING PUMP',
        'GENSET - COMPRESSOR - WELDING MACHINE',
    ];
    const activeNonGreasingCats = (nonGreasingCategories && nonGreasingCategories.length > 0)
        ? nonGreasingCategories
        : defaultNonGreasingCategories;

    const isNonGreasingCategory = (categoryName) => {
        if (!categoryName) return false;
        return activeNonGreasingCats.some(c => c.toUpperCase() === categoryName.trim().toUpperCase());
    };

    // Flat list of units for dropdown
    const flatUnitsList = (allUnits && allUnits.length > 0)
        ? allUnits
        : Object.values(groupedUnits).flat();

    // Add Entry Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [entryUnitIds, setEntryUnitIds] = useState([]);
    const [unitSearch, setUnitSearch] = useState('');
    const [unitTypeFilter, setUnitTypeFilter] = useState('all');
    const [entryDateMode, setEntryDateMode] = useState('single'); // 'single' | 'multi'
    const [entryDate, setEntryDate] = useState(
        `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(Math.min(new Date().getDate(), daysInMonth)).padStart(2, '0')}`
    );
    const [entryDays, setEntryDays] = useState([Math.min(new Date().getDate(), daysInMonth)]);
    const [entryCategories, setEntryCategories] = useState([activeTab !== 'achievement' ? activeTab : 'washing']);
    const [entryShifts, setEntryShifts] = useState(['shift_1', 'shift_2']);
    const [entryPhoto, setEntryPhoto] = useState(null);
    const [entryPhotoPreview, setEntryPhotoPreview] = useState(null);
    const [entryNotes, setEntryNotes] = useState('');
    const [submittingEntry, setSubmittingEntry] = useState(false);
    const [entryToast, setEntryToast] = useState(null);
    const [isAddModalFullScreen, setIsAddModalFullScreen] = useState(true);
    const [isPageFullScreen, setIsPageFullScreen] = useState(false);

    const togglePageFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => setIsPageFullScreen(true)).catch(() => {});
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().then(() => setIsPageFullScreen(false)).catch(() => {});
            }
        }
    };

    useEffect(() => {
        const handleFsChange = () => {
            setIsPageFullScreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFsChange);
        return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }, []);

    // Import Excel Modal states
    const [showImportModal, setShowImportModal] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [importing, setImporting] = useState(false);
    const [importError, setImportError] = useState(null);

    // Photo preview modal state
    const [previewPhotoModal, setPreviewPhotoModal] = useState(null);
    const [deletingEntry, setDeletingEntry] = useState(false);

    // Dashboard states
    const [dashData, setDashData] = useState(null);
    const [dashLoading, setDashLoading] = useState(false);
    const [dashStartDate, setDashStartDate] = useState(
        `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`
    );
    const [dashEndDate, setDashEndDate] = useState(
        `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`
    );
    const [dashUnitType, setDashUnitType] = useState('all');
    const [chartViewMode, setChartViewMode] = useState('2'); // '2' = 2 kolom besar (default), '1' = 1 kolom penuh, '4' = 4 kolom ringkas
    const [expandedChartKey, setExpandedChartKey] = useState(null); // 'inspection' | 'washing' | 'greasing' | 'cleaning_track' | null

    const fetchDashboardData = useCallback(async () => {
        setDashLoading(true);
        try {
            const res = await axios.get(route('plan-inspections.dashboard'), {
                params: { start_date: dashStartDate, end_date: dashEndDate, unit_type: dashUnitType }
            });
            setDashData(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setDashLoading(false);
        }
    }, [dashStartDate, dashEndDate, dashUnitType]);

    useEffect(() => {
        if (activeTab === 'achievement') fetchDashboardData();
    }, [activeTab, fetchDashboardData]);

    // Update default category in entry modal when tab changes
    useEffect(() => {
        if (activeTab !== 'achievement') {
            setEntryCategories([activeTab]);
        }
    }, [activeTab]);

    // Auto dismiss toast
    useEffect(() => {
        if (entryToast) {
            const timer = setTimeout(() => setEntryToast(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [entryToast]);

    // ─── Crosstab helpers ──────────────────────────────────────────────────
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const getWeekNumber = (day) => Math.ceil(day / 7);

    const handleToggle = async (unitId, day, shift = 'all', unitCategory = null) => {
        if (activeTab === 'achievement') return;
        const category = activeTab;
        const resolvedUnitCategory = unitCategory || flatUnitsList.find(u => u.id === unitId)?.type_unit;
        const is4Shift = (category === 'greasing' && is4ShiftCategory(resolvedUnitCategory));
        const targetShift = is4Shift ? shift : 'all';

        const prevData = JSON.parse(JSON.stringify(localPlanData));

        setLocalPlanData(prev => {
            const next = { ...prev };
            const unitData = { ...(next[unitId] || {}) };
            const catData = { ...(unitData[category] || {}) };

            if (is4Shift) {
                const dayObj = { ...(catData[day] || {}) };
                const currentShiftVal = dayObj[targetShift] || (targetShift === 'shift_1' ? (dayObj['pagi'] || dayObj['siang']) : (dayObj['sore'] || dayObj['malam']));
                const isChecked = !!currentShiftVal?.checked;

                if (isChecked) {
                    delete dayObj[targetShift];
                    if (targetShift === 'shift_1') {
                        delete dayObj['pagi'];
                        delete dayObj['siang'];
                    } else if (targetShift === 'shift_2') {
                        delete dayObj['sore'];
                        delete dayObj['malam'];
                    }
                } else {
                    dayObj[targetShift] = { checked: true, day, shift: targetShift };
                }
                catData[day] = dayObj;
            } else {
                const cellVal = catData[day];
                const isChecked = typeof cellVal === 'object' ? !!cellVal?.checked : !!cellVal;
                if (isChecked) {
                    delete catData[day];
                } else {
                    catData[day] = { checked: true, day, shift: 'all' };
                }
            }

            unitData[category] = catData;
            next[unitId] = unitData;
            return next;
        });

        try {
            await axios.post(route('plan-inspections.toggle'), {
                unit_id: unitId,
                day,
                month: currentMonth,
                year: currentYear,
                category,
                shift: targetShift,
            });
        } catch {
            setLocalPlanData(prevData);
            alert('Terjadi kesalahan saat menyimpan data.');
        }
    };

    const openAddEntryModal = (preselectUnitId = null, preselectDay = null) => {
        if (preselectUnitId) {
            setEntryUnitIds([preselectUnitId]);
        } else {
            setEntryUnitIds([]);
        }
        setUnitSearch('');
        setUnitTypeFilter('all');

        if (preselectDay) {
            setEntryDateMode('single');
            setEntryDate(`${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(preselectDay).padStart(2, '0')}`);
            setEntryDays([preselectDay]);
        } else {
            const today = new Date();
            const todayDay = today.getDate();
            const d = (today.getMonth() + 1 === currentMonth && today.getFullYear() === currentYear)
                ? todayDay
                : Math.min(todayDay, daysInMonth);
            setEntryDate(`${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
            setEntryDays([d]);
            setEntryDateMode('single');
        }

        const defaultCat = activeTab !== 'achievement' ? activeTab : 'washing';
        setEntryCategories([defaultCat]);

        setEntryPhoto(null);
        setEntryPhotoPreview(null);
        setEntryNotes('');
        setShowAddModal(true);
    };

    const toggleEntryDay = (day) => {
        setEntryDays(prev =>
            prev.includes(day)
                ? (prev.length > 1 ? prev.filter(d => d !== day) : prev)
                : [...prev, day].sort((a, b) => a - b)
        );
    };

    const selectAllDays = () => {
        setEntryDays(Array.from({ length: daysInMonth }, (_, i) => i + 1));
    };

    const selectWeekdays = () => {
        const days = [];
        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(currentYear, currentMonth - 1, d);
            const dayOfWeek = date.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                days.push(d);
            }
        }
        setEntryDays(days);
    };

    const clearAllDays = () => {
        const todayDay = Math.min(new Date().getDate(), daysInMonth);
        setEntryDays([todayDay]);
    };

    // Filtered units for modal multi-select picker
    const filteredModalUnits = flatUnitsList.filter(u => {
        const matchesType = unitTypeFilter === 'all' || (u.type_unit && u.type_unit.toUpperCase() === unitTypeFilter.toUpperCase());
        const q = unitSearch.toLowerCase().trim();
        const matchesSearch = !q || (
            (u.code_unit && u.code_unit.toLowerCase().includes(q)) ||
            (u.model && u.model.toLowerCase().includes(q)) ||
            (u.type_unit && u.type_unit.toLowerCase().includes(q))
        );
        return matchesType && matchesSearch;
    });

    const toggleUnitSelection = (unitId) => {
        setEntryUnitIds(prev =>
            prev.includes(unitId) ? prev.filter(id => id !== unitId) : [...prev, unitId]
        );
    };

    const selectAllFiltered = () => {
        const idsToAdd = filteredModalUnits.map(u => u.id);
        setEntryUnitIds(prev => Array.from(new Set([...prev, ...idsToAdd])));
    };

    const deselectAllFiltered = () => {
        const idsToRemove = new Set(filteredModalUnits.map(u => u.id));
        setEntryUnitIds(prev => prev.filter(id => !idsToRemove.has(id)));
    };

    const toggleCategorySelection = (catId) => {
        setEntryCategories(prev => {
            if (prev.includes(catId)) {
                if (prev.length === 1) return prev; // keep at least 1 category selected
                return prev.filter(c => c !== catId);
            } else {
                return [...prev, catId];
            }
        });
    };

    const selectAllCategories = () => {
        setEntryCategories(['washing', 'inspection', 'greasing', 'cleaning_track']);
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setEntryPhoto(file);
            setEntryPhotoPreview(URL.createObjectURL(file));
        }
    };

    const submitAddEntry = async (e) => {
        e.preventDefault();
        if (!entryUnitIds || entryUnitIds.length === 0) {
            alert('Silakan pilih minimal 1 unit terlebih dahulu.');
            return;
        }

        let selectedDates = [];
        if (entryDateMode === 'multi') {
            if (!entryDays || entryDays.length === 0) {
                alert('Silakan pilih minimal 1 tanggal kegiatan.');
                return;
            }
            selectedDates = entryDays.map(d => `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
        } else {
            if (!entryDate) {
                alert('Silakan pilih tanggal kegiatan.');
                return;
            }
            selectedDates = [entryDate];
        }

        if (!entryCategories || entryCategories.length === 0) {
            alert('Silakan pilih minimal 1 kategori kegiatan.');
            return;
        }

        setSubmittingEntry(true);
        const formData = new FormData();
        entryUnitIds.forEach(id => {
            formData.append('unit_ids[]', id);
        });
        selectedDates.forEach(dateStr => {
            formData.append('inspection_dates[]', dateStr);
        });
        formData.append('inspection_date', selectedDates[0]);
        entryCategories.forEach(cat => {
            formData.append('categories[]', cat);
        });
        formData.append('category', entryCategories[0] || 'washing');
        if (entryCategories.includes('greasing')) {
            entryShifts.forEach(s => {
                formData.append('shifts[]', s);
            });
            formData.append('shift', entryShifts[0] || 'shift_1');
        }
        if (entryPhoto) {
            formData.append('photo', entryPhoto);
        }
        if (entryNotes) {
            formData.append('notes', entryNotes);
        }

        try {
            const res = await axios.post(route('plan-inspections.store-entry'), formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const entries = res.data.entries || (res.data.entry ? [res.data.entry] : []);

            // If entries are in current viewed month & year, update local state
            setLocalPlanData(prev => {
                const next = { ...prev };
                entries.forEach(entry => {
                    if (entry.month === currentMonth && entry.year === currentYear) {
                        const unitGroup = flatUnitsList.find(u => u.id === entry.unit_id)?.type_unit;
                        const is4Shift = (entry.category === 'greasing' && is4ShiftCategory(unitGroup));

                        const unitData = { ...(next[entry.unit_id] || {}) };
                        const catData = { ...(unitData[entry.category] || {}) };

                        const entryItem = {
                            id: entry.id,
                            checked: true,
                            photo_path: entry.photo_path,
                            photo_url: entry.photo_url,
                            notes: entry.notes,
                            date: entry.date,
                            shift: entry.shift,
                        };

                        if (is4Shift) {
                            const dayObj = { ...(catData[entry.day] || {}) };
                            dayObj[entry.shift] = entryItem;
                            catData[entry.day] = dayObj;
                        } else {
                            catData[entry.day] = entryItem;
                        }

                        unitData[entry.category] = catData;
                        next[entry.unit_id] = unitData;
                    }
                });
                return next;
            });

            setShowAddModal(false);
            const unitCount = entryUnitIds.length;
            const dateCount = selectedDates.length;
            const catCount = entryCategories.length;
            setEntryToast(
                `✅ Berhasil menyimpan entri untuk ${unitCount} unit, ${dateCount} tanggal, dan ${catCount} kategori kegiatan! Kolom tabel otomatis tercentang.`
            );
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Gagal menyimpan entri kegiatan.');
        } finally {
            setSubmittingEntry(false);
        }
    };

    const handleImportExcel = async (e) => {
        e.preventDefault();
        if (!importFile) {
            setImportError('Silakan pilih file Excel (.xlsx / .xls) terlebih dahulu.');
            return;
        }

        setImporting(true);
        setImportError(null);

        const formData = new FormData();
        formData.append('file', importFile);
        formData.append('month', currentMonth);
        formData.append('year', currentYear);

        try {
            const res = await axios.post(route('plan-inspections.import-excel'), formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setShowImportModal(false);
            setImportFile(null);
            setEntryToast(`✅ ${res.data.message}`);
            router.reload({ only: ['planData', 'targetData'] });
        } catch (err) {
            console.error(err);
            setImportError(err.response?.data?.message || 'Gagal mengimpor file Excel. Pastikan format file sesuai template.');
        } finally {
            setImporting(false);
        }
    };

    const handleDeleteEntry = async (id, unitId, category, day, shift = null) => {
        if (!confirm('Apakah Anda yakin ingin menghapus entri kegiatan & foto ini?')) return;
        setDeletingEntry(true);
        try {
            const res = await axios.post(route('plan-inspections.delete-entry'), { id });
            const returnedShift = res.data.shift || shift;
            setLocalPlanData(prev => {
                const next = { ...prev };
                if (next[unitId]?.[category]?.[day]) {
                    if (returnedShift && returnedShift !== 'all' && typeof next[unitId][category][day] === 'object' && !next[unitId][category][day].checked) {
                        const dayObj = { ...next[unitId][category][day] };
                        delete dayObj[returnedShift];
                        if (returnedShift === 'shift_1') {
                            delete dayObj['pagi'];
                            delete dayObj['siang'];
                        } else if (returnedShift === 'shift_2') {
                            delete dayObj['sore'];
                            delete dayObj['malam'];
                        }
                        if (Object.keys(dayObj).length === 0) {
                            delete next[unitId][category][day];
                        } else {
                            next[unitId][category][day] = dayObj;
                        }
                    } else {
                        delete next[unitId][category][day];
                    }
                }
                return next;
            });
            setPreviewPhotoModal(null);
            setEntryToast('Entri kegiatan & foto berhasil dihapus.');
        } catch (err) {
            console.error(err);
            alert('Gagal menghapus entri.');
        } finally {
            setDeletingEntry(false);
        }
    };

    const calculateStats = (unitId, category, unitCategoryName) => {
        let totalActiv = 0;
        let weekCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        const unitCatData = localPlanData[unitId]?.[category] || {};
        const is4Shift = (category === 'greasing' && is4ShiftCategory(unitCategoryName));

        daysArray.forEach(day => {
            const cellVal = unitCatData[day];
            if (is4Shift) {
                if (cellVal && typeof cellVal === 'object' && !cellVal.checked) {
                    const s1Checked = cellVal['shift_1']?.checked || cellVal['pagi']?.checked || cellVal['siang']?.checked;
                    const s2Checked = cellVal['shift_2']?.checked || cellVal['sore']?.checked || cellVal['malam']?.checked;
                    if (s1Checked) {
                        weekCounts[getWeekNumber(day)]++;
                        totalActiv++;
                    }
                    if (s2Checked) {
                        weekCounts[getWeekNumber(day)]++;
                        totalActiv++;
                    }
                } else if (cellVal && (cellVal.checked || cellVal === true)) {
                    weekCounts[getWeekNumber(day)] += 2;
                    totalActiv += 2;
                }
            } else {
                const isChecked = typeof cellVal === 'object' ? !!cellVal?.checked : !!cellVal;
                if (isChecked) {
                    weekCounts[getWeekNumber(day)]++;
                    totalActiv++;
                }
            }
        });
        const targetPlann = localTargetData?.[unitId]?.[category] ?? 0;
        const ach = targetPlann > 0 ? ((totalActiv / targetPlann) * 100).toFixed(0) : '-';
        return { totalActiv, targetPlann, ach, weekCounts };
    };

    const weekColors = {
        1: 'bg-orange-200', 2: 'bg-blue-200', 3: 'bg-green-300',
        4: 'bg-blue-500 text-white', 5: 'bg-purple-500 text-white',
    };

    const tabs = [
        { id: 'washing',        label: '🧼 Washing Unit' },
        { id: 'inspection',     label: '🔍 Inspection Unit' },
        { id: 'greasing',       label: '🛢️ Greasing Unit' },
        { id: 'cleaning_track', label: '🚜 Cleaning Track' },
        { id: 'achievement',    label: '🏆 Achievement' },
    ];

    // ─── Crosstab renderer ─────────────────────────────────────────────────
    const renderCrosstab = () => (
        <div className="overflow-x-auto overflow-y-auto max-h-[70vh] border border-gray-300 custom-scrollbar relative mt-4">
            <p className="text-sm text-indigo-600 bg-indigo-50 px-3 py-1 border-b border-indigo-100">
                💡 <b>Plan Activity</b>: klik angka untuk mengubah target. &nbsp;|&nbsp; Klik sel tanggal untuk menambah/menghapus rencana.
            </p>
            {activeTab === 'cleaning_track' && (
                <p className="text-xs text-purple-700 bg-purple-50 px-3 py-1.5 border-b border-purple-200 flex items-center gap-1.5">
                    <span>🚜</span>
                    <span><b>Cleaning Track Khusus Unit Ber-Track:</b> Menampilkan 4 kategori ber-track (<b>CRUSHER</b>, <b>EXCAVATOR BIG DIGGER</b>, <b>EXCAVATOR SMALL DIGGER</b>, dan <b>BULLDOZER</b>).</span>
                </p>
            )}
            <table className="w-full text-xs text-center border-collapse whitespace-nowrap select-none">
                <thead className="sticky top-0 z-20 bg-gray-100 shadow-sm">
                    <tr>
                        <th rowSpan="2" className="border border-gray-400 px-1 py-0.5 sticky left-0 z-30 bg-yellow-400 font-bold w-8 min-w-[32px] max-w-[32px] text-xs">NO</th>
                        <th rowSpan="2" className="border border-gray-400 px-1.5 py-0.5 sticky left-[32px] z-30 bg-yellow-400 font-bold min-w-[95px] max-w-[100px] text-xs">MODEL</th>
                        <th rowSpan="2" className="border border-gray-400 px-1.5 py-0.5 sticky left-[127px] z-30 bg-yellow-400 font-bold min-w-[85px] max-w-[90px] text-xs">CODE/N</th>

                        {activeTab === 'greasing' ? (
                            daysArray.map(day => (
                                <th key={day} colSpan={2} className={`border border-gray-400 px-0.5 py-0.5 font-bold min-w-[38px] max-w-[42px] text-center text-xs ${weekColors[getWeekNumber(day)] || 'bg-gray-200'}`}>
                                    {day}
                                </th>
                            ))
                        ) : (
                            daysArray.map(day => (
                                <th key={day} className={`border border-gray-400 px-0.5 py-0.5 font-bold min-w-[20px] max-w-[24px] text-xs ${weekColors[getWeekNumber(day)] || 'bg-gray-200'}`}>
                                    {day}
                                </th>
                            ))
                        )}

                        <th rowSpan="2" className="border border-gray-400 px-1 py-0.5 bg-orange-200 font-bold min-w-[22px] max-w-[26px] text-[11px]">W1</th>
                        <th rowSpan="2" className="border border-gray-400 px-1 py-0.5 bg-blue-200 font-bold min-w-[22px] max-w-[26px] text-[11px]">W2</th>
                        <th rowSpan="2" className="border border-gray-400 px-1 py-0.5 bg-green-200 font-bold min-w-[22px] max-w-[26px] text-[11px]">W3</th>
                        <th rowSpan="2" className="border border-gray-400 px-1 py-0.5 bg-blue-300 font-bold min-w-[22px] max-w-[26px] text-[11px]">W4</th>
                        <th rowSpan="2" className="border border-gray-400 px-1 py-0.5 bg-purple-300 font-bold min-w-[22px] max-w-[26px] text-[11px]">W5</th>

                        <th rowSpan="2" className="border border-gray-400 px-1 py-0.5 bg-yellow-400 font-bold leading-tight min-w-[32px] text-[11px]">Total<br/>Activ</th>
                        <th rowSpan="2" className="border border-gray-400 px-1 py-0.5 bg-blue-400 text-white font-bold leading-tight min-w-[36px] text-[11px]">Plan<br/>Activity</th>
                        <th rowSpan="2" className="border border-gray-400 px-1 py-0.5 bg-yellow-400 font-bold min-w-[32px] text-[11px]">ACH</th>
                        <th rowSpan="2" className="border border-gray-400 px-1 py-0.5 bg-emerald-600 text-white font-bold leading-tight min-w-[85px] text-[11px]">DOKUMENTASI<br/>FOTO</th>
                    </tr>
                    <tr>
                        {activeTab === 'greasing' ? (
                            daysArray.map(day => (
                                <React.Fragment key={`sub-${day}`}>
                                    <th className="border border-gray-400 px-0.5 py-0 text-[10px] font-bold bg-amber-50 text-amber-900 w-[19px] min-w-[19px] max-w-[21px] text-center" title={`Tgl ${day} Shift 1`}>S1</th>
                                    <th className="border border-gray-400 px-0.5 py-0 text-[10px] font-bold bg-sky-50 text-sky-900 w-[19px] min-w-[19px] max-w-[21px] text-center" title={`Tgl ${day} Shift 2`}>S2</th>
                                </React.Fragment>
                            ))
                        ) : (
                            daysArray.map(day => <th key={`s-${day}`} className="border border-gray-400 px-0.5 py-0 bg-gray-50 h-2"></th>)
                        )}
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(groupedUnits)
                        .filter(typeUnit => (activeTab === 'cleaning_track' ? isCleaningTrackCategory(typeUnit) : true))
                        .map((typeUnit) => {
                        let no = 1;
                        return (
                            <React.Fragment key={typeUnit}>
                                <tr className="bg-gray-200 font-bold uppercase text-left">
                                    <td colSpan={3} className="border border-gray-400 px-1.5 py-0.5 sticky left-0 z-10 bg-gray-200 text-xs">{typeUnit}</td>
                                    <td colSpan={(activeTab === 'greasing' ? daysInMonth * 2 : daysInMonth) + 9} className="border border-gray-400 bg-gray-200 py-0.5"></td>
                                </tr>
                                {groupedUnits[typeUnit].map((unit) => {
                                    const is4Shift = activeTab === 'greasing' && is4ShiftCategory(typeUnit);
                                    const { totalActiv, targetPlann, ach, weekCounts } = calculateStats(unit.id, activeTab, typeUnit);
                                    const unitCatData = localPlanData[unit.id]?.[activeTab] || {};
                                    const achColor = ach !== '-' && ach >= 100 ? 'bg-green-500 text-white' : 'bg-gray-100';

                                    // Collect photos for activeTab
                                    const unitPhotos = [];
                                    daysArray.forEach(day => {
                                        const cellVal = unitCatData[day];
                                        if (is4Shift && cellVal && typeof cellVal === 'object' && !cellVal.checked) {
                                            ['shift_1', 'shift_2', 'pagi', 'siang', 'sore', 'malam'].forEach(sKey => {
                                                if (cellVal[sKey]?.photo_url) {
                                                    unitPhotos.push({
                                                        ...cellVal[sKey],
                                                        day,
                                                        shift: sKey,
                                                        unit_id: unit.id,
                                                        unitCode: unit.code_unit,
                                                        unitModel: unit.model,
                                                        category: activeTab,
                                                    });
                                                }
                                            });
                                        } else if (cellVal && typeof cellVal === 'object' && cellVal.photo_url) {
                                            unitPhotos.push({
                                                ...cellVal,
                                                day,
                                                unit_id: unit.id,
                                                unitCode: unit.code_unit,
                                                unitModel: unit.model,
                                                category: activeTab,
                                            });
                                        }
                                    });

                                    return (
                                        <tr key={unit.id} className="hover:bg-gray-50">
                                            <td className="border border-gray-400 px-1 py-0.5 sticky left-0 z-10 bg-white w-8 min-w-[32px] max-w-[32px] text-center text-xs">{no++}</td>
                                            <td className="border border-gray-400 px-1.5 py-0.5 sticky left-[32px] z-10 bg-white text-left min-w-[95px] max-w-[100px] text-xs truncate" title={unit.model}>{unit.model}</td>
                                            <td className="border border-gray-400 px-1.5 py-0.5 sticky left-[127px] z-10 bg-white text-center min-w-[85px] max-w-[90px] text-xs font-semibold">{unit.code_unit}</td>

                                            {daysArray.map(day => {
                                                const cellVal = unitCatData[day];

                                                // 1. Multi-shift (2 shifts: Shift 1 & Shift 2) unit under Greasing tab
                                                if (is4Shift) {
                                                    const shiftObj = (cellVal && typeof cellVal === 'object' && !cellVal.checked) ? cellVal : {};
                                                    const s1Item = shiftObj['shift_1'] || shiftObj['pagi'] || shiftObj['siang'];
                                                    const s2Item = shiftObj['shift_2'] || shiftObj['sore'] || shiftObj['malam'];

                                                    const shiftCols = [
                                                        { key: 'shift_1', label: 'Shift 1', title: 'Shift 1', item: s1Item, bgChecked: 'bg-amber-200 text-amber-950', hover: 'hover:bg-amber-100' },
                                                        { key: 'shift_2', label: 'Shift 2', title: 'Shift 2', item: s2Item, bgChecked: 'bg-sky-200 text-sky-950', hover: 'hover:bg-sky-100' },
                                                    ];

                                                    return (
                                                        <React.Fragment key={day}>
                                                            {shiftCols.map(s => {
                                                                const item = s.item;
                                                                const isChecked = !!item?.checked;
                                                                const hasPhoto = !!item?.photo_url;
                                                                return (
                                                                    <td
                                                                        key={s.key}
                                                                        onClick={() => handleToggle(unit.id, day, s.key, typeUnit)}
                                                                        className={`border border-gray-400 cursor-pointer text-center px-0.5 py-0 w-[19px] min-w-[19px] max-w-[21px] h-6 transition-colors ${s.hover} ${isChecked ? s.bgChecked : 'bg-white'}`}
                                                                        title={`Tgl ${day} [${s.title}]: ${isChecked ? 'Selesai (Klik untuk batalkan)' : 'Belum (Klik untuk centang)'}`}
                                                                    >
                                                                        {isChecked && (
                                                                            <div className="flex items-center justify-center gap-0.5">
                                                                                <span className="text-red-600 font-bold text-[11px] leading-none">✔</span>
                                                                                {hasPhoto && (
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            setPreviewPhotoModal({
                                                                                                ...item,
                                                                                                day,
                                                                                                shift: s.key,
                                                                                                unit_id: unit.id,
                                                                                                unitCode: unit.code_unit,
                                                                                                unitModel: unit.model,
                                                                                                category: activeTab,
                                                                                            });
                                                                                        }}
                                                                                        className="text-[9px] hover:scale-125 transition-transform"
                                                                                        title={`Lihat foto ${s.title}`}
                                                                                    >
                                                                                        📷
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                );
                                                            })}
                                                        </React.Fragment>
                                                    );
                                                }

                                                // 2. Unit under Greasing tab that does NOT have multiple shifts (spans 2 columns to align with daily shift headers)
                                                if (activeTab === 'greasing' && !is4Shift) {
                                                    const isChecked = typeof cellVal === 'object' ? !!cellVal?.checked : !!cellVal;
                                                    const hasPhoto = typeof cellVal === 'object' && !!cellVal?.photo_url;
                                                    return (
                                                        <td
                                                            key={day}
                                                            colSpan={2}
                                                            onClick={() => handleToggle(unit.id, day, 'all', typeUnit)}
                                                            className={`border border-gray-400 cursor-pointer text-center px-0.5 py-0 min-w-[38px] max-w-[42px] h-6 hover:bg-pink-100 transition-colors ${isChecked ? 'bg-pink-200' : 'bg-white'}`}
                                                            title={hasPhoto ? `Tgl ${day}: Ada foto dokumentasi (Klik kamera untuk lihat)` : `Tgl ${day}`}
                                                        >
                                                            {isChecked && (
                                                                <div className="flex items-center justify-center gap-0.5">
                                                                    <span className="text-red-600 font-bold text-[11px]">✔</span>
                                                                    {hasPhoto && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setPreviewPhotoModal({
                                                                                    ...cellVal,
                                                                                    day,
                                                                                    unit_id: unit.id,
                                                                                    unitCode: unit.code_unit,
                                                                                    unitModel: unit.model,
                                                                                    category: activeTab
                                                                                });
                                                                            }}
                                                                            className="text-[9px] p-0.5 hover:scale-125 transition-transform"
                                                                            title="Lihat foto kegiatan"
                                                                        >
                                                                            📷
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </td>
                                                    );
                                                }

                                                // 3. Other tabs (washing, inspection, cleaning_track)
                                                const isChecked = typeof cellVal === 'object' ? !!cellVal?.checked : !!cellVal;
                                                const hasPhoto = typeof cellVal === 'object' && !!cellVal?.photo_url;
                                                return (
                                                    <td
                                                        key={day}
                                                        onClick={() => handleToggle(unit.id, day, 'all', typeUnit)}
                                                        className={`border border-gray-400 cursor-pointer text-center px-0.5 py-0 min-w-[20px] max-w-[24px] h-6 hover:bg-pink-100 transition-colors ${isChecked ? 'bg-pink-200' : 'bg-white'}`}
                                                        title={hasPhoto ? `Tgl ${day}: Ada foto dokumentasi (Klik kamera untuk lihat)` : `Tgl ${day}`}
                                                    >
                                                        {isChecked && (
                                                            <div className="flex items-center justify-center gap-0.5">
                                                                <span className="text-red-600 font-bold text-[11px]">✔</span>
                                                                {hasPhoto && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setPreviewPhotoModal({
                                                                                ...cellVal,
                                                                                day,
                                                                                unit_id: unit.id,
                                                                                unitCode: unit.code_unit,
                                                                                unitModel: unit.model,
                                                                                category: activeTab
                                                                            });
                                                                        }}
                                                                        className="text-[9px] p-0.5 hover:scale-125 transition-transform"
                                                                        title="Lihat foto kegiatan"
                                                                    >
                                                                        📷
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>
                                                );
                                            })}

                                            {[1,2,3,4,5].map(w => (
                                                <td key={w} className={`border border-gray-400 px-0.5 py-0.5 text-center text-xs ${weekCounts[w] > 0 ? 'bg-pink-200 text-red-700 font-bold' : ''}`}>{weekCounts[w] || 0}</td>
                                            ))}

                                            <td className="border border-gray-400 px-1 py-0.5 font-bold bg-yellow-100 text-center text-xs">{totalActiv}</td>
                                            <td className="border border-gray-400 px-0.5 py-0.5 bg-blue-50 font-semibold text-center text-xs">
                                                <EditableTarget
                                                    key={`${unit.id}-${activeTab}-${currentMonth}-${currentYear}`}
                                                    unitId={unit.id}
                                                    category={activeTab}
                                                    month={currentMonth}
                                                    year={currentYear}
                                                    initialValue={localTargetData?.[unit.id]?.[activeTab] ?? 0}
                                                    onSave={(newVal) => handleTargetUpdated(unit.id, activeTab, newVal)}
                                                />
                                            </td>
                                            <td className={`border border-gray-400 px-1 py-0.5 font-bold text-center text-xs ${achColor}`}>{ach}{ach !== '-' ? '%' : ''}</td>
                                            <td className="border border-gray-400 px-1 py-0.5 bg-white text-center">
                                                <div className="flex items-center justify-center gap-1 flex-wrap">
                                                    {unitPhotos.map((item, pIdx) => (
                                                        <button
                                                            key={`${item.day}-${item.shift || 'all'}-${pIdx}`}
                                                            type="button"
                                                            onClick={() => setPreviewPhotoModal(item)}
                                                            className="relative group w-6 h-6 rounded border border-emerald-300 overflow-hidden shadow-xs hover:ring-2 hover:ring-emerald-500 transition-all flex-shrink-0"
                                                            title={`Tgl ${item.day}${item.shift && item.shift !== 'all' ? ` (${item.shift.toUpperCase()})` : ''}: ${item.notes || 'Klik untuk lihat foto'}`}
                                                        >
                                                            <img src={item.photo_url} alt={`Tgl ${item.day}`} className="w-full h-full object-cover" />
                                                            <span className="absolute bottom-0 right-0 bg-black/75 text-[7px] text-white px-0.5 font-bold leading-tight">
                                                                {item.day}{item.shift && item.shift !== 'all' ? `·${item.shift[0].toUpperCase()}` : ''}
                                                            </span>
                                                        </button>
                                                    ))}
                                                    <button
                                                        type="button"
                                                        onClick={() => openAddEntryModal(unit.id)}
                                                        className="inline-flex items-center justify-center px-1.5 py-0.5 rounded border border-dashed border-indigo-400 text-indigo-600 hover:bg-indigo-50 text-[10px] font-semibold gap-0.5 transition-colors flex-shrink-0"
                                                        title={`Upload foto & entri kegiatan untuk ${unit.code_unit}`}
                                                    >
                                                        <span>📷</span>
                                                        <span className="text-[10px]">+ Foto</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </React.Fragment>
                        );
                    })}
                    {Object.keys(groupedUnits).length === 0 && (
                        <tr><td colSpan={(activeTab === 'greasing' ? daysInMonth * 2 : daysInMonth) + 12} className="border px-4 py-8 text-center text-gray-500">Tidak ada data unit.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    // ─── Achievement Dashboard ─────────────────────────────────────────────
    const renderAchievement = () => {
        if (dashLoading || !dashData) {
            return (
                <div className="p-16 text-center">
                    <div className="inline-block w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                    <p className="text-gray-500">Memuat Dashboard...</p>
                </div>
            );
        }

        const { kpi, rekap, trend } = dashData;
        const allUnitTypes = dashData.unitTypes ?? unitTypes ?? [];

        // Build combo chart data
        const buildComboChart = (category) => {
            let chartRekap = rekap;
            if (category === 'cleaning_track') {
                chartRekap = rekap.filter(r => isCleaningTrackCategory(r.type));
            } else if (category === 'greasing') {
                chartRekap = rekap.filter(r => !isNonGreasingCategory(r.type));
            }

            return {
                labels: chartRekap.map(r => r.type),
                datasets: [
                    {
                        type: 'line',
                        label: 'Compliance %',
                        data: chartRekap.map(r => (r[category]?.plan > 0) ? +((r[category].actual / r[category].plan) * 100).toFixed(1) : 0),
                        borderColor: '#1e293b',
                        backgroundColor: '#1e293b',
                        borderWidth: 2.5,
                        pointBackgroundColor: '#ffffff',
                        pointBorderColor: '#1e293b',
                        pointBorderWidth: 2,
                        pointRadius: 4.5,
                        pointHoverRadius: 7,
                        yAxisID: 'y1',
                        tension: 0.25,
                    },
                    {
                        type: 'bar',
                        label: 'Planning',
                        data: chartRekap.map(r => r[category]?.plan ?? 0),
                        backgroundColor: '#10b981',
                        hoverBackgroundColor: '#059669',
                        borderRadius: 4,
                        maxBarThickness: 36,
                        yAxisID: 'y',
                    },
                    {
                        type: 'bar',
                        label: 'Actual',
                        data: chartRekap.map(r => r[category]?.actual ?? 0),
                        backgroundColor: '#3b82f6',
                        hoverBackgroundColor: '#2563eb',
                        borderRadius: 4,
                        maxBarThickness: 36,
                        yAxisID: 'y',
                    },
                ]
            };
        };

        const comboOpts = {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: {
                    position: 'top',
                    align: 'end',
                    labels: {
                        boxWidth: 14,
                        boxHeight: 14,
                        usePointStyle: true,
                        pointStyle: 'rectRounded',
                        font: { size: 12, weight: '600' },
                        padding: 14,
                        color: '#374151',
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    titleFont: { size: 13, weight: 'bold' },
                    bodyFont: { size: 12 },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            if (context.dataset.type === 'line') {
                                return ` ${context.dataset.label}: ${context.parsed.y}%`;
                            }
                            return ` ${context.dataset.label}: ${context.parsed.y} Unit`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        font: { size: 11, weight: '600' },
                        color: '#374151',
                        maxRotation: 45,
                        minRotation: 20,
                        autoSkip: false,
                    },
                    grid: { display: false }
                },
                y: {
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Unit (Plan / Actual)',
                        font: { size: 11, weight: '600' },
                        color: '#6b7280',
                    },
                    ticks: {
                        font: { size: 11 },
                        color: '#6b7280',
                        precision: 0,
                    },
                    grid: { color: 'rgba(243, 244, 246, 1)' }
                },
                y1: {
                    position: 'right',
                    min: 0,
                    max: 120,
                    title: {
                        display: true,
                        text: 'Compliance %',
                        font: { size: 11, weight: '600' },
                        color: '#374151',
                    },
                    grid: { drawOnChartArea: false },
                    ticks: {
                        font: { size: 11 },
                        color: '#374151',
                        callback: v => v + '%'
                    }
                }
            }
        };

        // Donut totals
        let inspPlan = 0, inspAct = 0, washPlan = 0, washAct = 0, greaPlan = 0, greaAct = 0, cleanPlan = 0, cleanAct = 0;
        rekap.forEach(r => {
            inspPlan += r.inspection?.plan ?? 0;
            inspAct += r.inspection?.actual ?? 0;
            washPlan += r.washing?.plan ?? 0;
            washAct += r.washing?.actual ?? 0;
            if (!isNonGreasingCategory(r.type)) {
                greaPlan += r.greasing?.plan ?? 0;
                greaAct += r.greasing?.actual ?? 0;
            }
            if (isCleaningTrackCategory(r.type)) {
                cleanPlan += r.cleaning_track?.plan ?? 0;
                cleanAct += r.cleaning_track?.actual ?? 0;
            }
        });
        const p = (a, b) => b > 0 ? +((a / b) * 100).toFixed(1) : 0;
        const inspPct = p(inspAct, inspPlan), washPct = p(washAct, washPlan), greaPct = p(greaAct, greaPlan), cleanPct = p(cleanAct, cleanPlan);

        // Total rekap row
        const totals = rekap.reduce(
            (acc, r) => {
                acc.iP += r.inspection?.plan ?? 0;
                acc.iA += r.inspection?.actual ?? 0;
                acc.wP += r.washing?.plan ?? 0;
                acc.wA += r.washing?.actual ?? 0;
                if (!isNonGreasingCategory(r.type)) {
                    acc.gP += r.greasing?.plan ?? 0;
                    acc.gA += r.greasing?.actual ?? 0;
                }
                if (isCleaningTrackCategory(r.type)) {
                    acc.cP += r.cleaning_track?.plan ?? 0;
                    acc.cA += r.cleaning_track?.actual ?? 0;
                }
                return acc;
            },
            { iP: 0, iA: 0, wP: 0, wA: 0, gP: 0, gA: 0, cP: 0, cA: 0 }
        );

        return (
            <div className="mt-4 space-y-4">
                {/* ── Header / Filters ── */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-teal-800 text-white px-5 py-4 rounded-xl shadow-lg gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-teal-600 p-2 rounded-lg">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold leading-tight">Achievement Maintenance</h2>
                            <p className="text-teal-200 text-sm">Inspection · Washing · Greasing · Cleaning Track · Performance vs Plan</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 items-end">
                        <div className="bg-teal-700 px-3 py-2 rounded-lg">
                            <p className="text-teal-300 text-xs mb-1">Dari Tanggal</p>
                            <input type="date" className="bg-transparent text-white text-sm border-none outline-none p-0 w-32"
                                value={dashStartDate} onChange={e => setDashStartDate(e.target.value)} />
                        </div>
                        <div className="bg-teal-700 px-3 py-2 rounded-lg">
                            <p className="text-teal-300 text-xs mb-1">Sampai Tanggal</p>
                            <input type="date" className="bg-transparent text-white text-sm border-none outline-none p-0 w-32"
                                value={dashEndDate} onChange={e => setDashEndDate(e.target.value)} />
                        </div>
                        <div className="bg-white rounded-lg px-3 py-2">
                            <p className="text-teal-600 text-xs mb-1 font-semibold">Tipe Unit</p>
                            <select className="text-sm text-gray-800 border-none outline-none p-0 bg-transparent" value={dashUnitType} onChange={e => setDashUnitType(e.target.value)}>
                                <option value="all">Semua Unit</option>
                                {allUnitTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <button onClick={fetchDashboardData} className="bg-teal-500 hover:bg-teal-400 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                            🔄 Refresh
                        </button>
                    </div>
                </div>

                {/* ── KPI Cards ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { label: 'Total Plan', value: kpi.totalPlan, sub: 'Aktivitas', color: 'border-green-500', ring: 'border-green-400 text-green-600', pct: '100' },
                        { label: 'Total Actual', value: kpi.totalActual, sub: 'Aktivitas', color: 'border-blue-500', ring: 'border-blue-400 text-blue-600', pct: kpi.compliance },
                        { label: 'Remaining', value: kpi.remaining, sub: 'Aktivitas', color: 'border-yellow-500', ring: 'border-yellow-400 text-yellow-600', pct: kpi.totalPlan > 0 ? (100 - kpi.compliance).toFixed(1) : 0 },
                        { label: 'Compliance', value: `${kpi.compliance}%`, sub: `${kpi.growth >= 0 ? '▲' : '▼'} ${Math.abs(kpi.growth)}% vs bln lalu`, color: 'border-purple-500', ring: 'border-purple-400 text-purple-600', pct: kpi.compliance },
                    ].map((c, i) => (
                        <div key={i} className={`bg-white rounded-xl shadow p-4 flex items-center justify-between border-l-4 ${c.color}`}>
                            <div>
                                <p className="text-gray-500 text-sm font-semibold">{c.label}</p>
                                <p className="text-2xl font-bold text-gray-800">{c.value}</p>
                                <p className={`text-sm ${i === 3 && kpi.growth >= 0 ? 'text-green-500' : i === 3 ? 'text-red-500' : 'text-gray-400'}`}>{c.sub}</p>
                            </div>
                            <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center text-sm font-bold ${c.ring}`}>
                                {c.pct}%
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── 4 Combo Charts Header & Switcher ── */}
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-5 py-3.5 rounded-xl shadow-xs border border-gray-100">
                        <div className="flex items-center gap-2.5">
                            <span className="text-base font-bold text-gray-800">📊 Grafik Pencapaian per Aktivitas</span>
                            <span className="hidden sm:inline-block text-xs px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 font-semibold border border-teal-200">
                                Planning vs Actual & Compliance %
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-lg">
                            <span className="text-xs text-gray-500 font-medium px-1.5 hidden md:inline">Ukuran:</span>
                            <button
                                type="button"
                                onClick={() => { setChartViewMode('2'); setExpandedChartKey(null); }}
                                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${chartViewMode === '2' && !expandedChartKey ? 'bg-white text-teal-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'}`}
                                title="Tampilkan 2 kolom besar (Rekomendasi)"
                            >
                                ⊞ 2 Kolom (Besar)
                            </button>
                            <button
                                type="button"
                                onClick={() => { setChartViewMode('1'); setExpandedChartKey(null); }}
                                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${chartViewMode === '1' && !expandedChartKey ? 'bg-white text-teal-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'}`}
                                title="Tampilkan 1 kolom penuh ekstra besar"
                            >
                                ☰ 1 Kolom (Penuh)
                            </button>
                            <button
                                type="button"
                                onClick={() => { setChartViewMode('4'); setExpandedChartKey(null); }}
                                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${chartViewMode === '4' && !expandedChartKey ? 'bg-white text-teal-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'}`}
                                title="Tampilkan 4 kolom ringkas"
                            >
                                ☵ 4 Kolom (Ringkas)
                            </button>
                        </div>
                    </div>

                    <div className={`grid gap-6 ${
                        chartViewMode === '1'
                            ? 'grid-cols-1'
                            : chartViewMode === '4'
                            ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4'
                            : 'grid-cols-1 lg:grid-cols-2'
                    }`}>
                        {[
                            { key: 'inspection',     num: '1', label: 'Inspection',     color: 'bg-teal-700' },
                            { key: 'washing',        num: '2', label: 'Washing',        color: 'bg-blue-700' },
                            { key: 'greasing',       num: '3', label: 'Greasing Unit',  color: 'bg-orange-600' },
                            { key: 'cleaning_track', num: '4', label: 'Cleaning Track', color: 'bg-purple-700' },
                        ].map(({ key, num, label, color }) => {
                            const isExpanded = expandedChartKey === key;
                            return (
                                <div
                                    key={key}
                                    className={`bg-white rounded-xl shadow-md p-5 border border-gray-100 transition-all duration-200 ${
                                        isExpanded ? 'col-span-full ring-2 ring-teal-500 shadow-lg' : ''
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-3.5">
                                        <h3 className="font-bold text-base flex items-center gap-2.5 text-gray-800">
                                            <span className={`${color} text-white w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold shadow-xs`}>
                                                {num}
                                            </span>
                                            <span>{label}</span>
                                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 font-normal">
                                                {key === 'cleaning_track' ? '4 Unit Track' : `${buildComboChart(key).labels.length} Unit`}
                                            </span>
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => setExpandedChartKey(isExpanded ? null : key)}
                                            className="px-2.5 py-1 text-xs font-semibold rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center gap-1.5 transition-colors"
                                            title={isExpanded ? 'Kembalikan ukuran normal' : 'Perbesar grafik ke ukuran penuh'}
                                        >
                                            {isExpanded ? (
                                                <>
                                                    <span>🗗</span>
                                                    <span>Kecilkan</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>⛶</span>
                                                    <span>Perbesar Penuh</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <div className={`${
                                        isExpanded
                                            ? 'h-[460px] md:h-[500px]'
                                            : chartViewMode === '1'
                                            ? 'h-[400px] md:h-[440px]'
                                            : chartViewMode === '4'
                                            ? 'h-64'
                                            : 'h-80 sm:h-96 md:h-[380px]'
                                    }`}>
                                        <Bar data={buildComboChart(key)} options={comboOpts} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── Bottom Section: Rekap Table & Category Summary ── */}
                <div className="space-y-6">

                    {/* Rekap table — Full width for maximum readability */}
                    <div className="bg-white rounded-xl shadow-md p-5 overflow-x-auto border border-gray-100">
                        <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
                            <h3 className="font-bold text-base text-gray-800 flex items-center gap-2">
                                <span>📋</span> Rekap Achievement per Jenis Unit
                            </h3>
                            <span className="text-xs text-gray-500 font-medium">Perbandingan Target Plan, Realisasi Actual & % Compliance per Kategori</span>
                        </div>
                        <table className="w-full text-sm text-center border-collapse">
                            <thead>
                                <tr>
                                    <th rowSpan={2} className="border p-2 bg-gray-100 text-gray-700 font-bold">No</th>
                                    <th rowSpan={2} className="border p-2 bg-gray-100 text-left min-w-[140px] text-gray-700 font-bold">Jenis Unit</th>
                                    <th colSpan={3} className="border p-2 bg-teal-600 text-white font-bold">Inspection</th>
                                    <th colSpan={3} className="border p-2 bg-blue-600 text-white font-bold">Washing</th>
                                    <th colSpan={3} className="border p-2 bg-orange-500 text-white font-bold">Greasing</th>
                                    <th colSpan={3} className="border p-2 bg-purple-600 text-white font-bold">Cleaning Track</th>
                                </tr>
                                <tr>
                                    {['Plan','Actual','%','Plan','Actual','%','Plan','Actual','%','Plan','Actual','%'].map((h, i) => (
                                        <th key={i} className={`border p-1.5 ${[2,5,8,11].includes(i) ? 'font-bold text-gray-900 bg-gray-100' : 'text-gray-600'} bg-gray-50 text-xs`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rekap.map((r, i) => {
                                    const hasGreasing = !isNonGreasingCategory(r.type);
                                    const hasCleanTrack = isCleaningTrackCategory(r.type);

                                    return (
                                        <tr key={r.type} className="hover:bg-gray-50/80 transition-colors">
                                            <td className="border p-1.5 text-gray-500">{i + 1}</td>
                                            <td className="border p-1.5 text-left font-semibold text-gray-800">{r.type}</td>

                                            {/* Inspection */}
                                            <td className="border p-1.5">{r.inspection?.plan ?? 0}</td>
                                            <td className="border p-1.5">{r.inspection?.actual ?? 0}</td>
                                            <td className="border p-1.5 font-bold text-teal-600">{p(r.inspection?.actual ?? 0, r.inspection?.plan ?? 0)}%</td>

                                            {/* Washing */}
                                            <td className="border p-1.5">{r.washing?.plan ?? 0}</td>
                                            <td className="border p-1.5">{r.washing?.actual ?? 0}</td>
                                            <td className="border p-1.5 font-bold text-blue-600">{p(r.washing?.actual ?? 0, r.washing?.plan ?? 0)}%</td>

                                            {/* Greasing */}
                                            {hasGreasing ? (
                                                <>
                                                    <td className="border p-1.5">{r.greasing?.plan ?? 0}</td>
                                                    <td className="border p-1.5">{r.greasing?.actual ?? 0}</td>
                                                    <td className="border p-1.5 font-bold text-orange-600">{p(r.greasing?.actual ?? 0, r.greasing?.plan ?? 0)}%</td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="border p-1.5 text-gray-400 bg-gray-50/60 font-normal">-</td>
                                                    <td className="border p-1.5 text-gray-400 bg-gray-50/60 font-normal">-</td>
                                                    <td className="border p-1.5 text-gray-400 bg-gray-50/60 font-normal">-</td>
                                                </>
                                            )}

                                            {/* Cleaning Track */}
                                            {hasCleanTrack ? (
                                                <>
                                                    <td className="border p-1.5">{r.cleaning_track?.plan ?? 0}</td>
                                                    <td className="border p-1.5">{r.cleaning_track?.actual ?? 0}</td>
                                                    <td className="border p-1.5 font-bold text-purple-600">{p(r.cleaning_track?.actual ?? 0, r.cleaning_track?.plan ?? 0)}%</td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="border p-1.5 text-gray-400 bg-gray-50/60 font-normal">-</td>
                                                    <td className="border p-1.5 text-gray-400 bg-gray-50/60 font-normal">-</td>
                                                    <td className="border p-1.5 text-gray-400 bg-gray-50/60 font-normal">-</td>
                                                </>
                                            )}
                                        </tr>
                                    );
                                })}
                                {/* Total row */}
                                <tr className="bg-gray-100 font-bold border-t-2 border-gray-400 text-gray-900">
                                    <td className="border p-2" colSpan={2}>Total</td>
                                    <td className="border p-2">{totals.iP}</td>
                                    <td className="border p-2">{totals.iA}</td>
                                    <td className="border p-2 text-teal-700 bg-teal-50/50">{p(totals.iA, totals.iP)}%</td>
                                    <td className="border p-2">{totals.wP}</td>
                                    <td className="border p-2">{totals.wA}</td>
                                    <td className="border p-2 text-blue-700 bg-blue-50/50">{p(totals.wA, totals.wP)}%</td>
                                    <td className="border p-2">{totals.gP}</td>
                                    <td className="border p-2">{totals.gA}</td>
                                    <td className="border p-2 text-orange-700 bg-orange-50/50">{p(totals.gA, totals.gP)}%</td>
                                    <td className="border p-2">{totals.cP}</td>
                                    <td className="border p-2">{totals.cA}</td>
                                    <td className="border p-2 text-purple-700 bg-purple-50/50">{p(totals.cA, totals.cP)}%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Donut & Trend Compliance */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Donut — 1 col */}
                        <div className="lg:col-span-1 bg-white rounded-xl shadow-md p-5 border border-gray-100 flex flex-col justify-between">
                            <div>
                                <h3 className="font-bold text-base mb-3 flex items-center gap-2 text-gray-800">
                                    <span>🎯</span> Compliance per Kategori
                                </h3>
                                <div className="h-56 relative flex items-center justify-center">
                                    <Doughnut
                                        data={{
                                            labels: ['Inspection', 'Washing', 'Greasing', 'Cleaning Track'],
                                            datasets: [{
                                                data: [inspPct, washPct, greaPct, cleanPct],
                                                backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'],
                                                borderWidth: 2
                                            }]
                                        }}
                                        options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: '68%' }}
                                    />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-2xl font-black text-gray-800">{kpi.compliance}%</span>
                                        <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Overall</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 space-y-2 text-sm">
                                {[
                                    { l: 'Inspection', v: inspPct, c: 'bg-teal-500' },
                                    { l: 'Washing', v: washPct, c: 'bg-blue-500' },
                                    { l: 'Greasing', v: greaPct, c: 'bg-yellow-500' },
                                    { l: 'Cleaning Track', v: cleanPct, c: 'bg-purple-500' },
                                ].map(i => (
                                    <div key={i.l} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-b-0">
                                        <span className="flex items-center gap-2 text-gray-700 font-medium">
                                            <span className={`w-3 h-3 rounded-full ${i.c}`}></span>{i.l}
                                        </span>
                                        <b className="text-gray-900">{i.v}%</b>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Trend line — 2 cols (Spacious & Clear) */}
                        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-5 border border-gray-100">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-bold text-base flex items-center gap-2 text-gray-800">
                                    <span>📈</span> Trend Compliance Bulanan
                                </h3>
                                <span className="text-xs text-gray-500 font-medium">Tren performa bulanan (Jan - Des)</span>
                            </div>
                            <div className="h-72">
                                <Line
                                    data={{
                                        labels: trend.labels,
                                        datasets: [
                                            { label: 'Inspection', data: trend.datasets.inspection, borderColor: '#10b981', backgroundColor: '#10b981', tension: 0.3, pointRadius: 4, pointHoverRadius: 6, borderWidth: 2.5 },
                                            { label: 'Washing', data: trend.datasets.washing, borderColor: '#3b82f6', backgroundColor: '#3b82f6', tension: 0.3, pointRadius: 4, pointHoverRadius: 6, borderWidth: 2.5 },
                                            { label: 'Greasing', data: trend.datasets.greasing, borderColor: '#f59e0b', backgroundColor: '#f59e0b', tension: 0.3, pointRadius: 4, pointHoverRadius: 6, borderWidth: 2.5 },
                                            { label: 'Cleaning Track', data: trend.datasets.cleaning_track ?? [], borderColor: '#8b5cf6', backgroundColor: '#8b5cf6', tension: 0.3, pointRadius: 4, pointHoverRadius: 6, borderWidth: 2.5 },
                                        ]
                                    }}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        interaction: { mode: 'index', intersect: false },
                                        plugins: {
                                            legend: {
                                                position: 'top',
                                                align: 'end',
                                                labels: {
                                                    boxWidth: 12,
                                                    boxHeight: 12,
                                                    usePointStyle: true,
                                                    font: { size: 11, weight: '600' },
                                                    padding: 12,
                                                }
                                            },
                                            tooltip: {
                                                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                                                padding: 10,
                                                cornerRadius: 8,
                                                titleFont: { size: 12, weight: 'bold' },
                                                bodyFont: { size: 11 },
                                                callbacks: {
                                                    label: v => ` ${v.dataset.label}: ${v.parsed.y}%`
                                                }
                                            }
                                        },
                                        scales: {
                                            y: {
                                                min: 0,
                                                max: 120,
                                                ticks: {
                                                    font: { size: 10 },
                                                    callback: v => v + '%'
                                                },
                                                grid: { color: 'rgba(243, 244, 246, 1)' }
                                            },
                                            x: {
                                                ticks: {
                                                    font: { size: 11, weight: '600' },
                                                    color: '#4b5563'
                                                },
                                                grid: { display: false }
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        );
    };

    // ─── Main Layout ───────────────────────────────────────────────────────
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Daily Maintenance Achievement</h2>}
        >
            <Head title="Daily Maintenance Achievement" />

            <div className="py-6 max-w-[100vw] overflow-hidden">
                <div className="mx-auto sm:px-4 lg:px-6">
                    <div className="bg-white shadow-sm sm:rounded-lg">
                        <div className="p-4 bg-white border-b border-gray-200">

                            {/* Toast Notification */}
                            {entryToast && (
                                <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl flex items-center justify-between shadow-sm">
                                    <div className="flex items-center gap-2.5">
                                        <span className="text-xl">✅</span>
                                        <span className="text-sm font-medium">{entryToast}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setEntryToast(null)}
                                        className="text-emerald-600 hover:text-emerald-900 text-sm font-bold ml-4 p-1 rounded hover:bg-emerald-100"
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}

                            {/* Month/Year filter (for crosstab tabs) */}
                            {activeTab !== 'achievement' && (
                                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-3">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <label className="font-semibold text-gray-700 text-sm">Bulan & Tahun:</label>
                                        <select
                                            className="rounded border-gray-300 shadow-sm text-sm"
                                            value={currentMonth}
                                            onChange={e => router.get(route('plan-inspections.index', { month: e.target.value, year: currentYear }))}
                                        >
                                            {[...Array(12)].map((_, i) => (
                                                <option key={i + 1} value={i + 1}>{new Date(2000, i, 1).toLocaleString('id-ID', { month: 'long' })}</option>
                                            ))}
                                        </select>
                                        <select
                                            className="rounded border-gray-300 shadow-sm text-sm"
                                            value={currentYear}
                                            onChange={e => router.get(route('plan-inspections.index', { month: currentMonth, year: e.target.value }))}
                                        >
                                            {[...Array(5)].map((_, i) => { const y = new Date().getFullYear() - 2 + i; return <option key={y} value={y}>{y}</option>; })}
                                        </select>

                                        {/* Button Add Entry */}
                                        <button
                                            type="button"
                                            onClick={() => openAddEntryModal()}
                                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white font-semibold text-sm rounded-lg shadow-sm hover:shadow transition-all focus:ring-2 focus:ring-indigo-400 focus:outline-none cursor-pointer"
                                        >
                                            <span>➕</span>
                                            <span>Tambah Entri (Add Entry) & Foto</span>
                                        </button>

                                        {/* Button Import Excel */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setImportFile(null);
                                                setImportError(null);
                                                setShowImportModal(true);
                                            }}
                                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg shadow-sm hover:shadow transition-all focus:ring-2 focus:ring-emerald-400 focus:outline-none cursor-pointer"
                                        >
                                            <span>📥</span>
                                            <span>Import Excel</span>
                                        </button>

                                        {/* Button Download Template Excel */}
                                        <a
                                            href={route('plan-inspections.download-template', { month: currentMonth, year: currentYear })}
                                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm rounded-lg border border-gray-300 shadow-xs hover:shadow-sm transition-all focus:ring-2 focus:ring-gray-300 focus:outline-none cursor-pointer"
                                            title="Unduh format template Excel untuk bulan ini"
                                        >
                                            <span>📄</span>
                                            <span>Template Excel</span>
                                        </a>

                                        {/* Button Full Screen */}
                                        <button
                                            type="button"
                                            onClick={togglePageFullScreen}
                                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm rounded-lg border border-gray-300 shadow-xs hover:shadow-sm transition-all focus:ring-2 focus:ring-gray-300 focus:outline-none cursor-pointer"
                                            title="Mode Layar Penuh (Full Screen)"
                                        >
                                            <span>{isPageFullScreen ? '🗗' : '⛶'}</span>
                                            <span>{isPageFullScreen ? 'Keluar Fullscreen' : 'Layar Penuh'}</span>
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-400 italic">* Klik kolom tanggal untuk ceklis · Klik kamera untuk foto · Klik Plan Activity untuk target</p>
                                </div>
                            )}

                            {/* Tabs */}
                            <div className="border-b border-gray-200">
                                <nav className="-mb-px flex space-x-2 overflow-x-auto">
                                    {tabs.map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-all ${
                                                activeTab === tab.id
                                                    ? 'border-teal-500 text-teal-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            {/* Content */}
                            {activeTab === 'achievement' ? renderAchievement() : renderCrosstab()}
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Modal Add Entry ──────────────────────────────────────────────── */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-2 sm:p-3 md:p-4 backdrop-blur-xs">
                    <div className={`bg-white shadow-2xl overflow-hidden border border-gray-200 flex flex-col transition-all duration-200 ${
                        isAddModalFullScreen
                            ? 'fixed inset-2 sm:inset-3 md:inset-4 lg:inset-5 rounded-2xl w-auto h-auto max-w-none max-h-none'
                            : 'max-w-xl w-full rounded-2xl max-h-[92vh]'
                    }`}>
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-indigo-700 px-6 py-3.5 text-white flex items-center justify-between shrink-0 shadow-xs">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl p-1.5 bg-white/10 rounded-xl">📝</span>
                                <div>
                                    <h3 className="text-base sm:text-lg font-bold">Tambah Entri Kegiatan & Upload Foto</h3>
                                    <p className="text-xs text-teal-100">Dapat memilih satu atau beberapa unit sekaligus · Otomatis centang tabel</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalFullScreen(!isAddModalFullScreen)}
                                    className="text-white/90 hover:text-white hover:bg-white/15 rounded-lg px-2.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/20 cursor-pointer"
                                    title={isAddModalFullScreen ? 'Kecilkan Tampilan (Window)' : 'Tampilan Penuh (Full Screen)'}
                                >
                                    <span>{isAddModalFullScreen ? '🗗' : '⛶'}</span>
                                    <span className="hidden sm:inline">{isAddModalFullScreen ? 'Kecilkan' : 'Full Screen'}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="text-white/80 hover:text-white hover:bg-white/15 rounded-full w-8 h-8 flex items-center justify-center transition-colors text-lg cursor-pointer"
                                    title="Tutup"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={submitAddEntry} className="flex-1 overflow-hidden flex flex-col min-h-0">
                            <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
                                <div className={isAddModalFullScreen ? 'grid grid-cols-1 lg:grid-cols-12 gap-6' : 'space-y-4'}>

                                    {/* Kolom Kiri: PILIH UNIT */}
                                    <div className={isAddModalFullScreen ? 'lg:col-span-5 flex flex-col space-y-3' : 'space-y-3'}>
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                                                <span>🚜</span>
                                                <span>Pilih Unit <span className="text-red-500">*</span></span>
                                            </label>
                                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold transition-all ${
                                                entryUnitIds.length > 0
                                                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                                                    : 'bg-gray-100 text-gray-500'
                                            }`}>
                                                {entryUnitIds.length} unit dipilih
                                            </span>
                                        </div>

                                        {/* Search & Type Filter bar */}
                                        <div className="flex items-center gap-2">
                                            <div className="relative flex-1">
                                                <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400 text-xs">
                                                    🔍
                                                </span>
                                                <input
                                                    type="text"
                                                    value={unitSearch}
                                                    onChange={e => setUnitSearch(e.target.value)}
                                                    placeholder="Cari kode unit atau model..."
                                                    className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg border-gray-300 shadow-xs focus:border-indigo-500 focus:ring-indigo-500"
                                                />
                                                {unitSearch && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setUnitSearch('')}
                                                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600 text-xs"
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                            </div>

                                            <select
                                                value={unitTypeFilter}
                                                onChange={e => setUnitTypeFilter(e.target.value)}
                                                className="text-xs rounded-lg border-gray-300 shadow-xs focus:border-indigo-500 focus:ring-indigo-500 py-1.5 max-w-[140px]"
                                            >
                                                <option value="all">Semua Jenis ({flatUnitsList.length})</option>
                                                {unitTypes.map(t => (
                                                    <option key={t} value={t}>{t}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Quick action buttons */}
                                        <div className="flex items-center justify-between text-[11px] px-0.5">
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={selectAllFiltered}
                                                    className="px-2.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold border border-indigo-200 transition-colors cursor-pointer"
                                                >
                                                    ✓ Centang Semua ({filteredModalUnits.length})
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={deselectAllFiltered}
                                                    className="px-2.5 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold transition-colors cursor-pointer"
                                                >
                                                    Batal Centang
                                                </button>
                                            </div>
                                            {entryUnitIds.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setEntryUnitIds([])}
                                                    className="text-red-600 hover:underline font-semibold cursor-pointer"
                                                >
                                                    Reset Semua ({entryUnitIds.length})
                                                </button>
                                            )}
                                        </div>

                                        {/* Selected Badges (Pills) */}
                                        {entryUnitIds.length > 0 && (
                                            <div className="p-2 bg-indigo-50/70 border border-indigo-100 rounded-lg">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                                                        Unit yang dipilih ({entryUnitIds.length}):
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto custom-scrollbar">
                                                    {entryUnitIds.map(uId => {
                                                        const u = flatUnitsList.find(item => item.id === uId);
                                                        if (!u) return null;
                                                        return (
                                                            <span
                                                                key={uId}
                                                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-indigo-300 text-indigo-900 rounded text-xs font-semibold shadow-xs"
                                                            >
                                                                <span>{u.code_unit}</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleUnitSelection(uId)}
                                                                    className="text-indigo-400 hover:text-red-600 font-bold ml-0.5 cursor-pointer"
                                                                    title={`Hapus ${u.code_unit}`}
                                                                >
                                                                    ✕
                                                                </button>
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Scrollable Unit List with Checkboxes */}
                                        <div className="border border-gray-300 rounded-xl overflow-hidden bg-white shadow-inner flex-1 min-h-[300px]">
                                            <div className={`overflow-y-auto divide-y divide-gray-100 custom-scrollbar ${
                                                isAddModalFullScreen ? 'max-h-[calc(100vh-380px)] min-h-[320px]' : 'max-h-52'
                                            }`}>
                                                {filteredModalUnits.length > 0 ? (
                                                    filteredModalUnits.map(u => {
                                                        const isSelected = entryUnitIds.includes(u.id);
                                                        return (
                                                            <div
                                                                key={u.id}
                                                                onClick={() => toggleUnitSelection(u.id)}
                                                                className={`px-3 py-2 flex items-center justify-between cursor-pointer transition-colors ${
                                                                    isSelected
                                                                        ? 'bg-indigo-50/90 text-indigo-900 font-semibold'
                                                                        : 'hover:bg-gray-50 text-gray-700'
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-2.5 min-w-0">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isSelected}
                                                                        onChange={() => {}}
                                                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 pointer-events-none"
                                                                    />
                                                                    <div className="truncate">
                                                                        <span className="font-bold text-xs mr-2">{u.code_unit}</span>
                                                                        <span className="text-[11px] text-gray-500">{u.model}</span>
                                                                    </div>
                                                                </div>
                                                                {u.type_unit && (
                                                                    <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded ml-2 flex-shrink-0">
                                                                        {u.type_unit}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <div className="p-6 text-center text-xs text-gray-400">
                                                        Tidak ada unit yang cocok dengan pencarian / filter.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Kolom Kanan: TANGGAL, KATEGORI, SHIFT, FOTO & CATATAN */}
                                    <div className={isAddModalFullScreen ? 'lg:col-span-7 flex flex-col space-y-4' : 'space-y-4'}>
                                        {/* Date Selector */}
                                        <div className="bg-gray-50/60 p-3.5 border border-gray-200 rounded-xl space-y-2.5">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                                                    <span>🗓️</span>
                                                    <span>Tanggal Kegiatan <span className="text-red-500">*</span></span>
                                                </label>

                                                {/* Mode switcher tabs */}
                                                <div className="inline-flex p-0.5 bg-gray-200/70 rounded-lg border border-gray-300">
                                                    <button
                                                        type="button"
                                                        onClick={() => setEntryDateMode('single')}
                                                        className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                                                            entryDateMode === 'single'
                                                                ? 'bg-white text-indigo-700 shadow-xs'
                                                                : 'text-gray-600 hover:text-gray-900'
                                                        }`}
                                                    >
                                                        📅 1 Tanggal
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setEntryDateMode('multi')}
                                                        className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                                                            entryDateMode === 'multi'
                                                                ? 'bg-indigo-600 text-white shadow-xs'
                                                                : 'text-gray-600 hover:text-gray-900'
                                                        }`}
                                                    >
                                                        🗓️ Banyak Tanggal Sekaligus
                                                    </button>
                                                </div>
                                            </div>

                                            {entryDateMode === 'single' ? (
                                                <div>
                                                    <input
                                                        type="date"
                                                        value={entryDate}
                                                        onChange={e => setEntryDate(e.target.value)}
                                                        required
                                                        className="w-full rounded-lg border-gray-300 shadow-xs focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2"
                                                    />
                                                    {entryDate && (() => {
                                                        const parts = entryDate.split('-');
                                                        if (parts.length === 3) {
                                                            const dYear = parseInt(parts[0], 10);
                                                            const dMonth = parseInt(parts[1], 10);
                                                            const dDay = parseInt(parts[2], 10);
                                                            const isViewingPeriod = (dMonth === currentMonth && dYear === currentYear);
                                                            const count = entryUnitIds.length;
                                                            return (
                                                                <div className={`mt-2 text-xs p-2.5 rounded-lg border flex items-start gap-2 ${
                                                                    isViewingPeriod 
                                                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                                                                        : 'bg-amber-50 border-amber-200 text-amber-800'
                                                                }`}>
                                                                    <span className="text-base leading-none">{isViewingPeriod ? '🎯' : '⚠️'}</span>
                                                                    <div>
                                                                        {isViewingPeriod ? (
                                                                            <span>
                                                                                <b>Langsung Centang Otomatis:</b> Tanggal <b>{dDay}</b> pada tabel bulan ini akan langsung tercentang <b>✔</b> untuk {count > 0 ? <b>{count} unit</b> : 'unit'} pada <b>{entryCategories.length} kategori</b> kegiatan terpilih!
                                                                            </span>
                                                                        ) : (
                                                                            <span>
                                                                                Tanggal kegiatan ({dDay}/{dMonth}/{dYear}) berada di luar bulan/tahun yang sedang aktif ({currentMonth}/{currentYear}). Data akan tersimpan pada periode tersebut.
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    })()}
                                                </div>
                                            ) : (
                                                /* Multi-Date Selector Grid */
                                                <div className="space-y-2.5">
                                                    <div className="flex flex-wrap items-center justify-between gap-1.5 text-[11px]">
                                                        <div className="flex items-center gap-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={selectAllDays}
                                                                className="px-2.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold border border-indigo-200 transition-colors cursor-pointer"
                                                            >
                                                                ✓ Semua (1-{daysInMonth})
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={selectWeekdays}
                                                                className="px-2.5 py-1 rounded bg-white hover:bg-gray-100 text-gray-700 font-semibold border border-gray-200 transition-colors cursor-pointer"
                                                                title="Pilih Senin sampai Jumat"
                                                            >
                                                                Hari Kerja
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={clearAllDays}
                                                                className="px-2.5 py-1 rounded bg-white hover:bg-gray-100 text-gray-600 font-semibold border border-gray-200 transition-colors cursor-pointer"
                                                            >
                                                                Reset
                                                            </button>
                                                        </div>
                                                        <span className="font-bold text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full text-xs">
                                                            {entryDays.length} tanggal dipilih
                                                        </span>
                                                    </div>

                                                    {/* Day buttons grid (1 to daysInMonth) */}
                                                    <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5 pt-1">
                                                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                                                            const isSelected = entryDays.includes(day);
                                                            return (
                                                                <button
                                                                    key={day}
                                                                    type="button"
                                                                    onClick={() => toggleEntryDay(day)}
                                                                    className={`h-9 rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                                                                        isSelected
                                                                            ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300 scale-105'
                                                                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
                                                                    }`}
                                                                >
                                                                    {day}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>

                                                    <div className="text-xs p-2.5 rounded-lg border bg-emerald-50 border-emerald-200 text-emerald-800 flex items-start gap-2">
                                                        <span className="text-base leading-none">🎯</span>
                                                        <div>
                                                            <b>Langsung Centang Otomatis ({entryDays.length} Tanggal):</b> Tanggal <b>{entryDays.join(', ')}</b> pada tabel bulan ini akan langsung tercentang <b>✔</b> untuk {entryUnitIds.length > 0 ? <b>{entryUnitIds.length} unit</b> : 'unit'} pada <b>{entryCategories.length} kategori</b> kegiatan!
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Category selector (Multi-select) */}
                                        <div>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                                                    <span>🏷️</span>
                                                    <span>Kategori Kegiatan <span className="text-red-500">*</span></span>
                                                    <span className="text-[11px] font-normal text-gray-500 lowercase">(1 sampai 4 kegiatan)</span>
                                                </label>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold transition-all ${
                                                        entryCategories.length > 1
                                                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                                            : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                                                    }`}>
                                                        {entryCategories.length} kategori dipilih
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={selectAllCategories}
                                                        className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                                                    >
                                                        Pilih Semua (4)
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                {[
                                                    { id: 'washing', label: 'Washing', icon: '🧼' },
                                                    { id: 'inspection', label: 'Inspection', icon: '🔍' },
                                                    { id: 'greasing', label: 'Greasing', icon: '🛢️' },
                                                    { id: 'cleaning_track', label: 'Cleaning Track', icon: '🚜' },
                                                ].map(c => {
                                                    const isSelected = entryCategories.includes(c.id);
                                                    return (
                                                        <button
                                                            key={c.id}
                                                            type="button"
                                                            onClick={() => toggleCategorySelection(c.id)}
                                                            className={`relative py-2.5 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer shadow-xs ${
                                                                isSelected
                                                                    ? 'border-indigo-600 bg-gradient-to-b from-indigo-50 to-indigo-100/70 text-indigo-800 ring-2 ring-indigo-400 shadow-sm'
                                                                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                                                            }`}
                                                        >
                                                            <div className={`absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                                                                isSelected
                                                                    ? 'bg-indigo-600 text-white shadow-xs'
                                                                    : 'border border-gray-300 text-transparent bg-gray-50'
                                                            }`}>
                                                                ✓
                                                            </div>
                                                            <span className="text-xl">{c.icon}</span>
                                                            <span className="leading-tight text-center">{c.label}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Greasing Shift Selector (for multi-shift units) */}
                                        {entryCategories.includes('greasing') && (
                                            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                                                        <span>🛢️</span>
                                                        <span>Shift Greasing</span>
                                                        <span className="text-[10px] text-amber-700 font-normal lowercase">(unit multi-shift)</span>
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (entryShifts.length === 2) {
                                                                setEntryShifts(['shift_1']);
                                                            } else {
                                                                setEntryShifts(['shift_1', 'shift_2']);
                                                            }
                                                        }}
                                                        className="text-[11px] font-semibold text-amber-800 hover:underline cursor-pointer"
                                                    >
                                                        {entryShifts.length === 2 ? 'Pilih 1 Shift' : 'Pilih Semua (2 Shift)'}
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {[
                                                        { id: 'shift_1', label: 'Shift 1', time: 'Shift Siang / 1' },
                                                        { id: 'shift_2', label: 'Shift 2', time: 'Shift Malam / 2' },
                                                    ].map(s => {
                                                        const isSelected = entryShifts.includes(s.id);
                                                        return (
                                                            <button
                                                                key={s.id}
                                                                type="button"
                                                                onClick={() => {
                                                                    if (entryShifts.includes(s.id)) {
                                                                        if (entryShifts.length > 1) {
                                                                            setEntryShifts(entryShifts.filter(x => x !== s.id));
                                                                        }
                                                                    } else {
                                                                        setEntryShifts([...entryShifts, s.id]);
                                                                    }
                                                                }}
                                                                className={`py-2 px-2.5 rounded-lg border text-xs font-bold flex flex-col items-center justify-center transition-all cursor-pointer ${
                                                                    isSelected
                                                                        ? 'border-amber-600 bg-amber-500 text-white shadow-xs'
                                                                        : 'border-amber-200 bg-white text-gray-700 hover:bg-amber-100/50'
                                                                }`}
                                                            >
                                                                <span>{s.label}</span>
                                                                <span className={`text-[9px] font-normal ${isSelected ? 'text-amber-100' : 'text-gray-400'}`}>{s.time}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                                <p className="text-[10px] text-amber-700 leading-tight">
                                                    *Berlaku untuk unit multi-shift: CRUSHER, EXCAVATOR BIG & SMALL DIGGER, BULLDOZER, MOTOR GRADER, CRANE TRUCK & LOWBOY. Untuk unit 1 kolom lainnya, entri disimpan sebagai harian.
                                                </p>
                                            </div>
                                        )}

                                        {/* Sub-grid for Foto & Catatan */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                                            {/* Upload Foto */}
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                                    <span>📷</span>
                                                    <span>Upload Foto Dokumentasi</span>
                                                    <span className="text-gray-400 font-normal lowercase">(opsional)</span>
                                                </label>
                                                <div className="flex justify-center px-4 pt-3 pb-3 border-2 border-gray-300 border-dashed rounded-xl hover:border-indigo-400 bg-gray-50/50 transition-colors">
                                                    {entryPhotoPreview ? (
                                                        <div className="relative group w-full flex flex-col items-center">
                                                            <img
                                                                src={entryPhotoPreview}
                                                                alt="Preview"
                                                                className="max-h-36 rounded-lg object-contain border border-gray-200 shadow-sm"
                                                            />
                                                            <div className="mt-1.5 flex items-center gap-2">
                                                                <span className="text-xs text-gray-500 truncate max-w-[180px]">{entryPhoto?.name}</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => { setEntryPhoto(null); setEntryPhotoPreview(null); }}
                                                                    className="text-xs text-red-600 hover:underline font-semibold cursor-pointer"
                                                                >
                                                                    Hapus
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-1 text-center py-2">
                                                            <div className="text-2xl text-gray-400 mb-0.5">📸</div>
                                                            <div className="flex text-xs text-gray-600 justify-center">
                                                                <label
                                                                    htmlFor="photo-upload-input"
                                                                    className="relative cursor-pointer rounded-md font-semibold text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                                                                >
                                                                    <span>Pilih file gambar</span>
                                                                    <input
                                                                        id="photo-upload-input"
                                                                        type="file"
                                                                        accept="image/*"
                                                                        className="sr-only"
                                                                        onChange={handlePhotoChange}
                                                                    />
                                                                </label>
                                                                <p className="pl-1">atau tarik ke sini</p>
                                                            </div>
                                                            <p className="text-[10px] text-gray-400">PNG, JPG, JPEG, WEBP max 10MB</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Catatan Kegiatan */}
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                                    <span>📝</span>
                                                    <span>Catatan Kegiatan</span>
                                                    <span className="text-gray-400 font-normal lowercase">(opsional)</span>
                                                </label>
                                                <textarea
                                                    rows={4}
                                                    value={entryNotes}
                                                    onChange={e => setEntryNotes(e.target.value)}
                                                    placeholder="Contoh: Washing menyeluruh bagian undercarriage dan cabin..."
                                                    className="w-full rounded-xl border-gray-300 shadow-xs focus:border-indigo-500 focus:ring-indigo-500 text-xs p-2.5 h-[106px] resize-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions Footer */}
                            <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                                <div className="text-xs text-gray-600 flex items-center gap-2 flex-wrap">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg font-bold">
                                        <span>🎯</span>
                                        <span>{entryUnitIds.length} Unit</span>
                                    </span>
                                    <span className="text-gray-300">•</span>
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-teal-50 border border-teal-200 text-teal-700 rounded-lg font-bold">
                                        <span>🗓️</span>
                                        <span>{entryDateMode === 'multi' ? entryDays.length : (entryDate ? 1 : 0)} Tanggal</span>
                                    </span>
                                    <span className="text-gray-300">•</span>
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 border border-purple-200 text-purple-700 rounded-lg font-bold">
                                        <span>🏷️</span>
                                        <span>{entryCategories.length} Kategori</span>
                                    </span>
                                </div>
                                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                                        disabled={submittingEntry}
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submittingEntry}
                                        className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                                    >
                                        {submittingEntry ? (
                                            <>
                                                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                                <span>Menyimpan...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>💾</span>
                                                <span>
                                                    {entryUnitIds.length > 1 || (entryDateMode === 'multi' && entryDays.length > 1)
                                                        ? `Simpan (${entryUnitIds.length} Unit, ${entryDateMode === 'multi' ? entryDays.length : 1} Tgl) & Centang`
                                                        : 'Simpan Entri & Centang Tanggal'}
                                                </span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ─── Modal Import Excel ────────────────────────────────────────────── */}
            {showImportModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-4 text-white flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <span className="text-2xl">📥</span>
                                <div>
                                    <h3 className="text-base font-bold">Import Data Kegiatan dari Excel</h3>
                                    <p className="text-xs text-emerald-100">Centang banyak unit dan banyak tanggal sekaligus via file .xlsx</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowImportModal(false)}
                                className="text-white/80 hover:text-white hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center transition-colors cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleImportExcel} className="p-6 space-y-4">
                            {/* Step 1: Download Template */}
                            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                                <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                    <span>1️⃣</span>
                                    <span>Langkah 1: Unduh Format Template Excel</span>
                                </h4>
                                <p className="text-xs text-emerald-800 mb-2.5">
                                    Template sudah berisi 125 unit dalam 17 kategori lengkap dengan 4 sheet (Washing, Inspection, Greasing, Cleaning Track) dan kolom tanggal 1-{daysInMonth}.
                                </p>
                                <a
                                    href={route('plan-inspections.download-template', { month: currentMonth, year: currentYear })}
                                    className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                                >
                                    <span>📄</span>
                                    <span>Unduh Template Excel ({new Date(currentYear, currentMonth - 1, 1).toLocaleString('id-ID', { month: 'long' })} {currentYear})</span>
                                </a>
                            </div>

                            {/* Step 2: Upload Filled File */}
                            <div>
                                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                    <span>2️⃣</span>
                                    <span>Langkah 2: Unggah File Excel yang Sudah Diisi</span>
                                </h4>
                                <p className="text-xs text-gray-500 mb-2">
                                    Isi angka <b>1</b> atau huruf <b>X</b> pada kolom tanggal untuk menandai centang kegiatan pada unit yang diinginkan.
                                </p>

                                <div className="border-2 border-dashed border-gray-300 hover:border-emerald-500 rounded-xl p-4 bg-gray-50/60 text-center transition-colors">
                                    {importFile ? (
                                        <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-emerald-200 shadow-xs">
                                            <div className="flex items-center gap-2.5 text-left min-w-0">
                                                <span className="text-2xl text-emerald-600">📊</span>
                                                <div className="truncate">
                                                    <p className="text-xs font-bold text-gray-800 truncate">{importFile.name}</p>
                                                    <p className="text-[10px] text-gray-500">{(importFile.size / 1024).toFixed(1)} KB</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setImportFile(null)}
                                                className="text-xs text-red-500 hover:text-red-700 font-semibold p-1 hover:bg-red-50 rounded cursor-pointer"
                                            >
                                                Ganti
                                            </button>
                                        </div>
                                    ) : (
                                        <div>
                                            <span className="text-3xl text-gray-400 mb-1 inline-block">📁</span>
                                            <div className="text-xs text-gray-600 flex justify-center">
                                                <label
                                                    htmlFor="excel-upload-input"
                                                    className="cursor-pointer font-semibold text-emerald-600 hover:text-emerald-700 focus-within:outline-none"
                                                >
                                                    <span>Klik untuk memilih file Excel</span>
                                                    <input
                                                        id="excel-upload-input"
                                                        type="file"
                                                        accept=".xlsx, .xls, .csv"
                                                        className="sr-only"
                                                        onChange={e => {
                                                            if (e.target.files?.[0]) {
                                                                setImportFile(e.target.files[0]);
                                                                setImportError(null);
                                                            }
                                                        }}
                                                    />
                                                </label>
                                                <span className="pl-1">atau tarik file ke sini</span>
                                            </div>
                                            <p className="text-[10px] text-gray-400 mt-1">Format: .xlsx, .xls (Maks. 20MB)</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Error display */}
                            {importError && (
                                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start gap-2">
                                    <span>⚠️</span>
                                    <span>{importError}</span>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setShowImportModal(false)}
                                    className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                                    disabled={importing}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={importing || !importFile}
                                    className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                                >
                                    {importing ? (
                                        <>
                                            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                            <span>Mengimpor Data...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>🚀</span>
                                            <span>Proses & Simpan Semua Centang</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ─── Modal Photo Preview ──────────────────────────────────────────── */}
            {previewPhotoModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 flex items-center justify-center p-4 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-200">
                        {/* Header */}
                        <div className="bg-gray-900 px-6 py-4 text-white flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-bold flex items-center gap-2">
                                    <span>📷</span>
                                    <span>Dokumentasi Kegiatan: {previewPhotoModal.unitCode}</span>
                                </h3>
                                <p className="text-xs text-gray-300 mt-0.5 flex items-center gap-1.5 flex-wrap">
                                    <span>{previewPhotoModal.unitModel}</span>
                                    <span>·</span>
                                    <span>Kategori: <span className="capitalize font-semibold text-yellow-400">{previewPhotoModal.category}</span></span>
                                    <span>·</span>
                                    <span>Tanggal {previewPhotoModal.day || new Date(previewPhotoModal.date).getDate()}</span>
                                    {previewPhotoModal.shift && previewPhotoModal.shift !== 'all' && (
                                        <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-gray-900 uppercase">
                                            {previewPhotoModal.shift.replace('_', ' ')}
                                        </span>
                                    )}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setPreviewPhotoModal(null)}
                                className="text-gray-400 hover:text-white rounded-full w-8 h-8 flex items-center justify-center text-lg transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Photo body */}
                        <div className="p-4 bg-gray-100 flex items-center justify-center min-h-[250px] max-h-[65vh] overflow-hidden">
                            <img
                                src={previewPhotoModal.photo_url}
                                alt="Dokumentasi Kegiatan"
                                className="max-h-[60vh] w-auto max-w-full rounded-lg object-contain shadow-md"
                            />
                        </div>

                        {/* Notes if any */}
                        {previewPhotoModal.notes && (
                            <div className="px-6 py-3 bg-blue-50 border-t border-b border-blue-100 text-xs text-blue-900">
                                <p className="font-bold text-blue-800 uppercase tracking-wider text-[10px] mb-0.5">Catatan / Keterangan:</p>
                                <p className="whitespace-pre-line">{previewPhotoModal.notes}</p>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="px-6 py-3.5 bg-white flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => handleDeleteEntry(
                                    previewPhotoModal.id,
                                    previewPhotoModal.unit_id,
                                    previewPhotoModal.category,
                                    previewPhotoModal.day || new Date(previewPhotoModal.date).getDate(),
                                    previewPhotoModal.shift
                                )}
                                disabled={deletingEntry}
                                className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                            >
                                <span>🗑️</span>
                                <span>{deletingEntry ? 'Menghapus...' : 'Hapus Entri & Foto'}</span>
                            </button>

                            <div className="flex items-center gap-2">
                                <a
                                    href={previewPhotoModal.photo_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-300 transition-colors"
                                >
                                    Buka Foto Penuh ↗
                                </a>
                                <button
                                    type="button"
                                    onClick={() => setPreviewPhotoModal(null)}
                                    className="px-4 py-1.5 text-xs font-semibold text-white bg-gray-800 hover:bg-gray-900 rounded-lg transition-colors"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #9ca3af; border-radius: 4px; }
                table td, table th { border: 1px dashed #d1d5db; }
                thead th { border-style: solid; }
            `}</style>
        </AuthenticatedLayout>
    );
}
