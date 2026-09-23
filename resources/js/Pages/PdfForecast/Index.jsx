import React, { useEffect, useRef, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import Chart from 'chart.js/auto';

export default function ForecastPaIndex({
    kpiBudget,
    chartForecastRealisasi,
    chartDistribusiKategori,
    chartTopUnit,
    tableDetailForecast,
    rekapDepartment,
    rekapKategori,
    pdfTabs,
    pdfData,
    unitsMaster
}) {
    const allTabs = ['DASHBOARD', ...(pdfTabs || [])];
    const [activeTab, setActiveTab] = useState('DASHBOARD');
    const forecastChartRef = useRef(null);
    const distribusiChartRef = useRef(null);
    const topUnitChartRef = useRef(null);

    // Search and filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUnitFilter, setSelectedUnitFilter] = useState('ALL');
    const [selectedDeptFilter, setSelectedDeptFilter] = useState('Semua');
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('Semua');

    // Toast notification
    const [toastMessage, setToastMessage] = useState(null);
    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 4000);
    };

    const getTabIcon = (tab) => {
        const t = (tab || '').toUpperCase();
        if (t === 'DASHBOARD') return '📊';
        if (t.includes('DOZER') || t.includes('BULLDOZER')) return '🚜';
        if (t.includes('EXCAVATOR')) return '🏗️';
        if (t.includes('DUMP') || t.includes('TRUCK')) return '🚛';
        if (t.includes('DEWATERING') || t.includes('PUMP')) return '💧';
        if (t.includes('OHT') || t.includes('HAULER')) return '🚚';
        if (t.includes('GRADER') || t.includes('SEM') || t.includes('GD') || t.includes('CAT 14')) return '🚜';
        if (t.includes('COMPACTOR')) return '🚜';
        if (t.includes('LIGHT') || t.includes('VEHICLE')) return '🚙';
        if (t.includes('TOOL')) return '🛠️';
        if (t.includes('ATK')) return '📋';
        if (t.includes('TOWER') || t.includes('LAMP') || t.includes('PRAMAC') || t.includes('HIMOINSA')) return '💡';
        return '📁';
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSelectedUnitFilter('ALL');
        setSearchQuery('');
    };

    const getUnitsForTab = (tabName) => {
        const t = (tabName || '').toUpperCase();
        if (unitsMaster && unitsMaster.length > 0) {
            const matched = unitsMaster.filter(u => {
                if (t === 'BULLDOZER') return u.category === 'BULLDOZER';
                if (t === 'EXCAVATOR') return u.category === 'EXCAVATOR';
                if (t === 'DUMP TRUCK') return u.category === 'DUMP TRUCK';
                if (t === 'DEWATERING') return u.category === 'DEWATERING';
                if (t === 'OHT') return u.category === 'OHT';
                return u.category === t;
            });
            if (matched.length > 0) return matched;
        }
        return (pdfData?.[tabName] || []).map(b => ({
            code_unit: b.code_unit,
            type_unit: b.type_unit,
            model: b.type_unit,
            hm: b.hm,
            category: tabName
        }));
    };

    const handleUnitCodeChange = (code) => {
        const trimmed = (code || '').trim().toUpperCase();
        const found = unitsMaster?.find(u => u.code_unit.toUpperCase() === trimmed)
            || (pdfData?.[addModal.formData.tab] || []).find(b => b.code_unit.toUpperCase() === trimmed);
        setAddModal(prev => ({
            ...prev,
            formData: {
                ...prev.formData,
                code_unit: code,
                type_unit: found ? (found.type_unit || found.model || prev.formData.type_unit) : prev.formData.type_unit,
                hm: found ? (found.hm || prev.formData.hm) : prev.formData.hm,
            }
        }));
    };

    // Modal View & Edit Entry State
    const [itemModal, setItemModal] = useState({
        isOpen: false,
        mode: 'view', // 'view' or 'edit'
        tab: '',
        unitCode: '',
        typeUnit: '',
        hm: '',
        item: null,
        formData: {
            tab: '',
            code_unit: '',
            type_unit: '',
            hm: '',
            code_budget: '',
            cost_element: '',
            code_depart: '',
            uraian: '',
            std_qty: '',
            forecast_qty: '',
            satuan: '',
            unit_rate: '',
            amount: '',
        }
    });

    // Modal Add Entry State
    const [addModal, setAddModal] = useState({
        isOpen: false,
        formData: {
            tab: '',
            custom_tab: '',
            code_unit: '',
            type_unit: '',
            hm: '',
            code_budget: '',
            cost_element: 'Tools',
            code_depart: '',
            uraian: '',
            std_qty: '1',
            forecast_qty: '',
            satuan: 'Pcs',
            unit_rate: '',
            amount: '',
        }
    });

    // Modal Monthly Summary State
    const [monthlyModal, setMonthlyModal] = useState({
        isOpen: false,
        data: null,
    });

    // Open Detail Modal (Double click on row)
    const handleOpenItemModal = (item, unitBlock, tabName, initialMode = 'view') => {
        const qty = item.forecast_qty || '';
        const rate = item.unit_rate ?? '';
        const amt = item.amount ?? (Number(qty || 0) * Number(rate || 0));

        setItemModal({
            isOpen: true,
            mode: initialMode,
            tab: tabName,
            unitCode: unitBlock?.code_unit || tabName,
            typeUnit: unitBlock?.type_unit || '',
            hm: unitBlock?.hm || '',
            item: item,
            formData: {
                tab: tabName,
                code_unit: unitBlock?.code_unit || tabName,
                type_unit: unitBlock?.type_unit || '',
                hm: unitBlock?.hm || '',
                code_budget: item.code_budget || '',
                cost_element: item.cost_element || '',
                code_depart: item.code_depart || '',
                uraian: item.uraian || '',
                std_qty: item.std_qty || '',
                forecast_qty: qty,
                satuan: item.satuan || 'Pcs',
                unit_rate: rate,
                amount: amt,
            }
        });
    };

    // Open Add Modal
    const handleOpenAddModal = (currentTab) => {
        const targetTab = currentTab === 'DASHBOARD' ? (pdfTabs?.[0] || 'BULLDOZER') : currentTab;
        const tabUnits = getUnitsForTab(targetTab);
        const defaultCodeUnit = tabUnits.length > 0 ? tabUnits[0].code_unit : (pdfData?.[targetTab]?.[0]?.code_unit || targetTab);
        const defaultTypeUnit = tabUnits.length > 0 ? (tabUnits[0].type_unit || tabUnits[0].model) : (pdfData?.[targetTab]?.[0]?.type_unit || '');
        const defaultHm = tabUnits.length > 0 ? tabUnits[0].hm : (pdfData?.[targetTab]?.[0]?.hm || '');
        const isEquipment = ['BULLDOZER', 'EXCAVATOR', 'DUMP TRUCK', 'DEWATERING', 'OHT', 'CAT 14', 'GD755-5R', 'SEM 922 AWD', 'COMPACTOR SSR220C'].includes(targetTab.toUpperCase());

        setAddModal({
            isOpen: true,
            formData: {
                tab: targetTab,
                custom_tab: '',
                code_unit: defaultCodeUnit,
                type_unit: defaultTypeUnit,
                hm: defaultHm,
                code_budget: '',
                cost_element: isEquipment ? 'PM Service' : (targetTab === 'TOOLS' ? 'Tools' : 'Others'),
                code_depart: 'Plant',
                uraian: '',
                std_qty: '1',
                forecast_qty: '',
                satuan: 'Pcs',
                unit_rate: '',
                amount: '',
            }
        });
    };

    // Submit Edit
    const handleUpdateItem = (e) => {
        e.preventDefault();
        if (!itemModal.item?.id) {
            showToast('ID entri tidak valid.');
            return;
        }

        const payload = {
            ...itemModal.formData,
            unit_rate: parseFloat(itemModal.formData.unit_rate) || 0,
            amount: parseFloat(itemModal.formData.amount) || 0,
        };

        router.put(`/forecast-budget-monthly/${itemModal.item.id}`, payload, {
            preserveScroll: true,
            onSuccess: () => {
                setItemModal(prev => ({ ...prev, isOpen: false }));
                showToast('✓ Entri forecast budget berhasil diperbarui.');
            },
            onError: (err) => {
                const first = Object.values(err)[0];
                alert(first || 'Gagal memperbarui entri.');
            }
        });
    };

    // Delete Item
    const handleDeleteItem = () => {
        if (!itemModal.item?.id) return;
        if (!window.confirm(`Hapus item "${itemModal.formData.uraian || 'ini'}" dari forecast budget?`)) {
            return;
        }

        router.delete(`/forecast-budget-monthly/${itemModal.item.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setItemModal(prev => ({ ...prev, isOpen: false }));
                showToast('✓ Entri forecast budget berhasil dihapus.');
            }
        });
    };

    // Submit Add
    const handleStoreItem = (e) => {
        e.preventDefault();
        const tabFinal = addModal.formData.tab === '__NEW__' 
            ? addModal.formData.custom_tab.trim().toUpperCase() 
            : addModal.formData.tab;

        if (!tabFinal) {
            alert('Pilih atau masukkan nama tab / kategori.');
            return;
        }

        const payload = {
            ...addModal.formData,
            tab: tabFinal,
            code_unit: addModal.formData.code_unit || tabFinal,
            unit_rate: parseFloat(addModal.formData.unit_rate) || 0,
            amount: parseFloat(addModal.formData.amount) || 0,
        };

        router.post('/forecast-budget-monthly', payload, {
            preserveScroll: true,
            onSuccess: () => {
                setAddModal(prev => ({ ...prev, isOpen: false }));
                showToast('✓ Entri baru berhasil ditambahkan.');
                if (tabFinal !== activeTab && tabFinal !== 'DASHBOARD') {
                    setActiveTab(tabFinal);
                }
            },
            onError: (err) => {
                const first = Object.values(err)[0];
                alert(first || 'Gagal menyimpan entri.');
            }
        });
    };

    // Double click monthly summary
    const handleOpenMonthlyModal = (monthRow) => {
        setMonthlyModal({
            isOpen: true,
            data: monthRow,
        });
    };

    useEffect(() => {
        let forecastInstance = null;
        let distribusiInstance = null;
        let topUnitInstance = null;

        // --- BAR CHART: Forecast vs Realisasi ---
        if (forecastChartRef.current) {
            const ctx = forecastChartRef.current.getContext('2d');
            forecastInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: chartForecastRealisasi.labels,
                    datasets: [
                        {
                            label: 'Forecast 2026',
                            data: chartForecastRealisasi.forecast,
                            backgroundColor: '#10b981', // green
                            borderRadius: 2,
                            barPercentage: 0.7,
                            categoryPercentage: 0.8
                        },
                        {
                            label: 'Realisasi 2025',
                            data: chartForecastRealisasi.realisasi,
                            backgroundColor: '#0ea5e9', // blue
                            borderRadius: 2,
                            barPercentage: 0.7,
                            categoryPercentage: 0.8
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                            labels: { usePointStyle: true, boxWidth: 8, font: { size: 10 } }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 2000,
                            ticks: { 
                                font: { size: 9 },
                                callback: function(value) {
                                    return value + 'M';
                                }
                            },
                            grid: { color: '#f3f4f6' },
                            title: {
                                display: true,
                                text: 'Biaya (Rp)',
                                font: { size: 9, weight: 'bold' }
                            }
                        },
                        x: {
                            grid: { display: false },
                            ticks: { font: { size: 9 } }
                        }
                    }
                }
            });
        }

        // --- DOUGHNUT CHART: Distribusi Budget per Kategori ---
        if (distribusiChartRef.current) {
            const ctx = distribusiChartRef.current.getContext('2d');
            distribusiInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: chartDistribusiKategori.map(item => item.name),
                    datasets: [{
                        data: chartDistribusiKategori.map(item => item.value),
                        backgroundColor: chartDistribusiKategori.map(item => item.color),
                        borderWidth: 2,
                        borderColor: '#ffffff',
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '60%',
                    plugins: {
                        legend: { display: false },
                    }
                },
                plugins: [{
                    id: 'custom_text_dist',
                    beforeDraw: function(chart) {
                        const width = chart.width;
                        const height = chart.height;
                        const ctx = chart.ctx;
                        ctx.restore();
                        
                        const chartArea = chart.chartArea;
                        const centerX = (chartArea.left + chartArea.right) / 2;
                        const centerY = (chartArea.top + chartArea.bottom) / 2;

                        ctx.font = "bold 14px Arial";
                        ctx.fillStyle = "#1f2937";
                        ctx.textBaseline = "middle";
                        const textVal = `Rp ${kpiBudget?.total_forecast?.amount ? kpiBudget.total_forecast.amount.split(',')[0] + ' M' : '12.65 M'}`;
                        const textValX = Math.round(centerX - ctx.measureText(textVal).width / 2);
                        ctx.fillText(textVal, textValX, centerY - 6);

                        ctx.font = "10px Arial";
                        ctx.fillStyle = "#6b7280";
                        const textTop = "Total Budget";
                        const textTopX = Math.round(centerX - ctx.measureText(textTop).width / 2);
                        ctx.fillText(textTop, textTopX, centerY + 10);
                        
                        ctx.save();
                    }
                }]
            });
        }

        // --- HORIZONTAL BAR CHART: Top 5 Budget per Jenis Unit ---
        if (topUnitChartRef.current) {
            const ctx = topUnitChartRef.current.getContext('2d');
            topUnitInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: chartTopUnit.map(item => item.name),
                    datasets: [{
                        data: chartTopUnit.map(item => item.value),
                        backgroundColor: chartTopUnit.map(item => item.color),
                        borderRadius: 4,
                        barThickness: 14
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        x: {
                            display: false,
                            max: 4000
                        },
                        y: {
                            grid: { display: false },
                            ticks: { font: { size: 10 }, color: '#4b5563' },
                            border: { display: false }
                        }
                    },
                    animation: {
                        onComplete: function(animation) {
                            const chartInstance = animation.chart;
                            const ctx = chartInstance.ctx;
                            ctx.font = "bold 10px Arial";
                            ctx.fillStyle = "#1f2937";
                            ctx.textAlign = "left";
                            ctx.textBaseline = "middle";

                            chartInstance.data.datasets.forEach((dataset, i) => {
                                const meta = chartInstance.getDatasetMeta(i);
                                meta.data.forEach((bar, index) => {
                                    const data = dataset.data[index];
                                    ctx.fillText(`${data}M`, bar.x + 5, bar.y);
                                });
                            });
                        }
                    }
                }
            });
        }

        return () => {
            if (forecastInstance) forecastInstance.destroy();
            if (distribusiInstance) distribusiInstance.destroy();
            if (topUnitInstance) topUnitInstance.destroy();
        };
    }, [chartForecastRealisasi, chartDistribusiKategori, chartTopUnit, kpiBudget]);

    // Filtered unit blocks for active tab
    const currentUnitBlocks = pdfData && pdfData[activeTab] ? pdfData[activeTab] : [];
    const availableUnitsInTab = currentUnitBlocks.map(b => ({
        code_unit: b.code_unit,
        type_unit: b.type_unit,
        itemCount: b.items ? b.items.length : 0
    }));

    const filteredUnitBlocks = currentUnitBlocks
        .filter(block => {
            if (selectedUnitFilter !== 'ALL' && block.code_unit !== selectedUnitFilter) {
                return false;
            }
            return true;
        })
        .map(block => {
            if (!searchQuery) return block;
            const q = searchQuery.toLowerCase();
            const matchingItems = (block.items || []).filter(item => 
                (item.uraian && item.uraian.toLowerCase().includes(q)) ||
                (item.code_budget && item.code_budget.toLowerCase().includes(q)) ||
                (item.cost_element && item.cost_element.toLowerCase().includes(q)) ||
                (item.code_depart && item.code_depart.toLowerCase().includes(q)) ||
                (block.code_unit && block.code_unit.toLowerCase().includes(q))
            );
            return {
                ...block,
                items: matchingItems
            };
        }).filter(block => (block.items && block.items.length > 0) || (!searchQuery && selectedUnitFilter === 'ALL'));

    return (
        <AuthenticatedLayout>
            <Head title="Forecast Budget Monthly" />
            
            <div className="space-y-4">
                
                {/* Toast Notification Banner */}
                {toastMessage && (
                    <div className="fixed top-20 right-6 z-50 bg-emerald-700 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold animate-bounce">
                        <span>✨</span>
                        <span>{toastMessage}</span>
                    </div>
                )}

                {/* Header Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center font-bold">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11V3H8v6H2v12h20V11h-6zm-6-6h4v14h-4V5zm-6 6h4v8H4v-8zm16 8h-4v-6h4v6z"/></svg>
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                                    <span>Forecast Budget Monthly</span>
                                    <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                                        Active
                                    </span>
                                </h1>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    💡 <em>Double-klik baris tabel untuk melihat rincian & menyunting data.</em>
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <div className="text-xs text-gray-400 flex items-center gap-1">
                                <span>Home</span> › <span>Budget</span> › <span className="text-gray-600 font-bold">Forecast Budget Monthly</span>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap justify-end">
                                <div className="flex items-center gap-1.5 mr-1">
                                    <span className="text-xs font-bold text-gray-500 uppercase">Tahun</span>
                                    <select className="text-sm border border-gray-300 text-gray-700 rounded-lg focus:ring-[#10b981] focus:border-[#10b981] px-2 py-1 h-8 font-bold">
                                        <option>2026</option>
                                        <option>2025</option>
                                    </select>
                                </div>

                                {/* ADD ENTRY BUTTON */}
                                <button
                                    type="button"
                                    onClick={() => handleOpenAddModal(activeTab)}
                                    className="bg-[#10b981] hover:bg-[#059669] text-white px-3.5 py-1.5 rounded-lg text-sm font-bold shadow-sm flex items-center gap-1.5 transition cursor-pointer"
                                    title="Tambah data baru ke forecast budget"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
                                    <span>+ Add Entry</span>
                                </button>

                                <button 
                                    type="button"
                                    onClick={() => window.print()}
                                    className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm flex items-center gap-1.5 transition cursor-pointer"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg> 
                                    Print
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Tabs Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex overflow-x-auto custom-scrollbar">
                        {allTabs.map((tab, index) => (
                            <button
                                key={index}
                                onClick={() => handleTabChange(tab)}
                                className={`px-4 py-3.5 text-[12px] font-bold whitespace-nowrap transition-colors border-b-2 flex items-center gap-1.5 ${
                                    activeTab === tab 
                                    ? 'border-[#10b981] text-[#10b981] bg-emerald-50/40 font-black' 
                                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                                }`}
                            >
                                <span>{getTabIcon(tab)}</span>
                                <span>{tab}</span>
                                {tab !== 'DASHBOARD' && pdfData && pdfData[tab] && (
                                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                                        activeTab === tab ? 'bg-emerald-200/80 text-emerald-900' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                        {pdfData[tab].reduce((acc, b) => acc + (b.items ? b.items.length : 0), 0)}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {activeTab === 'DASHBOARD' ? (
                    <>
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Total Forecast */}
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-[#0ea5e9] opacity-10 group-hover:opacity-20 transition-opacity"></div>
                                <div className="w-14 h-14 bg-[#0ea5e9] text-white rounded-lg flex items-center justify-center shadow-sm relative z-10">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2 1.5 3 4 3h8c2.5 0 4-1 4-3V7m-4-4v4H8V3M4 11h16M4 15h16"></path></svg>
                                </div>
                                <div className="relative z-10">
                                    <div className="text-sm font-bold text-gray-500">Total Forecast Budget</div>
                                    <div className="text-xl font-black text-gray-900 leading-tight tracking-tight mt-0.5">Rp {kpiBudget.total_forecast.amount}</div>
                                    <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                        <span className="text-[#f97316] font-bold">↗ {kpiBudget.total_forecast.vs_realisasi}</span> vs Realisasi 2025
                                    </div>
                                </div>
                            </div>

                            {/* Planned Maintenance */}
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-[#10b981] opacity-10 group-hover:opacity-20 transition-opacity"></div>
                                <div className="w-14 h-14 bg-[#10b981] text-white rounded-lg flex items-center justify-center shadow-sm relative z-10">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                </div>
                                <div className="relative z-10">
                                    <div className="text-sm font-bold text-gray-500">Planned Maintenance</div>
                                    <div className="text-xl font-black text-gray-900 leading-tight tracking-tight mt-0.5">Rp {kpiBudget.planned_maintenance.amount}</div>
                                    <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                        <span className="text-[#10b981] font-bold">{kpiBudget.planned_maintenance.pct}</span> dari total budget
                                    </div>
                                </div>
                            </div>

                            {/* Corrective Maintenance */}
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-[#facc15] opacity-10 group-hover:opacity-20 transition-opacity"></div>
                                <div className="w-14 h-14 bg-[#facc15] text-white rounded-lg flex items-center justify-center shadow-sm relative z-10">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                                </div>
                                <div className="relative z-10">
                                    <div className="text-sm font-bold text-gray-500">Corrective Maintenance</div>
                                    <div className="text-xl font-black text-gray-900 leading-tight tracking-tight mt-0.5">Rp {kpiBudget.corrective_maintenance.amount}</div>
                                    <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                        <span className="text-[#f97316] font-bold">↗ {kpiBudget.corrective_maintenance.pct}</span> dari total budget
                                    </div>
                                </div>
                            </div>

                            {/* Project / Improvement */}
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-[#ef4444] opacity-10 group-hover:opacity-20 transition-opacity"></div>
                                <div className="w-14 h-14 bg-[#ef4444] text-white rounded-lg flex items-center justify-center shadow-sm relative z-10">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                </div>
                                <div className="relative z-10">
                                    <div className="text-sm font-bold text-gray-500">Project / Improvement</div>
                                    <div className="text-xl font-black text-gray-900 leading-tight tracking-tight mt-0.5">Rp {kpiBudget.project_improvement.amount}</div>
                                    <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                        <span className="text-[#ef4444] font-bold">{kpiBudget.project_improvement.pct}</span> dari total budget
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Charts Area */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                            {/* Bar Chart: Forecast vs Realisasi */}
                            <div className="lg:col-span-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col h-[280px]">
                                <h3 className="font-bold text-gray-800 text-[12px] mb-2">Forecast vs Realisasi (Per Bulan)</h3>
                                <div className="flex-1 relative w-full pt-2">
                                    <canvas ref={forecastChartRef}></canvas>
                                </div>
                            </div>

                            {/* Doughnut Chart: Distribusi Budget */}
                            <div className="lg:col-span-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col h-[280px]">
                                <h3 className="font-bold text-gray-800 text-[12px] mb-4">Distribusi Budget per Kategori</h3>
                                <div className="flex-1 flex flex-col items-center">
                                    <div className="w-full h-[140px] relative mb-4">
                                        <canvas ref={distribusiChartRef}></canvas>
                                    </div>
                                    <div className="w-full flex flex-col justify-center gap-1.5 text-xs">
                                        {chartDistribusiKategori.map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <div className="w-2.5 h-2.5 rounded-sm mr-1.5 flex-shrink-0" style={{ backgroundColor: item.color }}></div>
                                                    <div className="flex flex-col">
                                                        <span className="text-gray-900 font-bold truncate">{item.name}</span>
                                                        <span className="text-gray-500 font-bold">Rp {Number(item.value).toLocaleString('id-ID')}0,000</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Horizontal Bar Chart: Top 5 */}
                            <div className="lg:col-span-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col h-[280px]">
                                <h3 className="font-bold text-gray-800 text-[12px] mb-4">Top 5 Budget per Jenis Unit</h3>
                                <div className="flex-1 relative w-full pt-2">
                                    <canvas ref={topUnitChartRef}></canvas>
                                </div>
                            </div>
                        </div>

                        {/* Filter Row */}
                        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-wrap items-end gap-3">
                            <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
                                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Department</label>
                                <select 
                                    value={selectedDeptFilter}
                                    onChange={e => setSelectedDeptFilter(e.target.value)}
                                    className="w-full text-sm border border-gray-300 text-gray-700 rounded-lg focus:ring-[#10b981] focus:border-[#10b981] px-2 py-1.5 h-8 font-medium"
                                >
                                    <option value="Semua">Semua Department</option>
                                    {rekapDepartment.map(d => <option key={d.no} value={d.dept}>{d.dept}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
                                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Kategori</label>
                                <select 
                                    value={selectedCategoryFilter}
                                    onChange={e => setSelectedCategoryFilter(e.target.value)}
                                    className="w-full text-sm border border-gray-300 text-gray-700 rounded-lg focus:ring-[#10b981] focus:border-[#10b981] px-2 py-1.5 h-8 font-medium"
                                >
                                    <option value="Semua">Semua Kategori</option>
                                    {rekapKategori.map(k => <option key={k.no} value={k.kategori}>{k.kategori}</option>)}
                                </select>
                            </div>
                            <div className="relative min-w-[200px] flex-1">
                                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Cari Data</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        placeholder="Cari deskripsi item, kode budget, atau unit..." 
                                        className="w-full text-sm border border-gray-300 text-gray-700 rounded-lg focus:ring-[#10b981] focus:border-[#10b981] px-2 py-1.5 pl-7 h-8 font-medium"
                                    />
                                    <svg className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    type="button"
                                    onClick={() => { setSearchQuery(''); setSelectedDeptFilter('Semua'); setSelectedCategoryFilter('Semua'); }}
                                    className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-bold transition shadow-sm h-8 flex items-center gap-1.5 cursor-pointer"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg> Reset
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleOpenAddModal('DASHBOARD')}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg text-sm font-bold transition shadow-sm h-8 flex items-center gap-1.5 cursor-pointer"
                                >
                                    <span>+ Add Entry</span>
                                </button>
                            </div>
                        </div>

                        {/* Detail Forecast Budget Bulanan (Jan - Dec) */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col mt-4">
                            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                                <div>
                                    <h2 className="font-black text-gray-900 text-sm tracking-tight flex items-center gap-2">
                                        <span>Detail Forecast Budget Bulanan (Tahun 2026)</span>
                                        <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                                            12 Bulan
                                        </span>
                                    </h2>
                                    <p className="text-[11px] text-gray-500 mt-0.5">
                                        💡 <em>Double-klik baris bulan di bawah ini untuk melihat rincian bulan terkait.</em>
                                    </p>
                                </div>
                                <span className="text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                                    Double-Klik Aktif ✓
                                </span>
                            </div>
                            <div className="p-0 overflow-x-auto">
                                <table className="w-full text-xs text-left whitespace-nowrap border-collapse">
                                    <thead className="bg-gray-100 text-gray-700 border-b border-gray-200">
                                        <tr>
                                            <th className="px-3 py-2.5 font-bold text-center w-12 border-r border-gray-200">No.</th>
                                            <th className="px-4 py-2.5 font-bold border-r border-gray-200 w-24">Bulan</th>
                                            <th className="px-4 py-2.5 font-bold text-right border-r border-gray-200">Planned Maint (Rp)</th>
                                            <th className="px-4 py-2.5 font-bold text-right border-r border-gray-200">Corrective Maint (Rp)</th>
                                            <th className="px-4 py-2.5 font-bold text-right border-r border-gray-200">Project / Imp (Rp)</th>
                                            <th className="px-4 py-2.5 font-bold text-right border-r border-gray-200 bg-emerald-50/50 text-emerald-900">Total Budget (Rp)</th>
                                            <th className="px-4 py-2.5 font-bold text-right border-r border-gray-200">Realisasi (Rp)</th>
                                            <th className="px-3 py-2.5 font-bold text-center border-r border-gray-200 w-24">Selisih</th>
                                            <th className="px-3 py-2.5 font-bold text-center border-r border-gray-200 w-28">Status</th>
                                            <th className="px-2 py-2.5 font-bold text-center w-16">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-gray-700">
                                        {tableDetailForecast.map((m, idx) => (
                                            <tr 
                                                key={m.no || idx}
                                                onDoubleClick={() => handleOpenMonthlyModal(m)}
                                                className="hover:bg-emerald-50/70 transition-colors cursor-pointer group"
                                                title="Double-klik untuk melihat rincian bulan ini"
                                            >
                                                <td className="px-3 py-2 text-center border-r border-gray-100 font-bold text-gray-400">{m.no}</td>
                                                <td className="px-4 py-2 font-black text-gray-900 border-r border-gray-100 flex items-center gap-1.5">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                    <span>{m.bulan}</span>
                                                </td>
                                                <td className="px-4 py-2 text-right font-mono border-r border-gray-100">{m.planned}</td>
                                                <td className="px-4 py-2 text-right font-mono border-r border-gray-100">{m.corrective}</td>
                                                <td className="px-4 py-2 text-right font-mono border-r border-gray-100">{m.project}</td>
                                                <td className="px-4 py-2 text-right font-mono font-black text-emerald-800 bg-emerald-50/30 border-r border-gray-100">{m.total}</td>
                                                <td className="px-4 py-2 text-right font-mono border-r border-gray-100">{m.realisasi}</td>
                                                <td className="px-3 py-2 text-center font-bold text-emerald-700 border-r border-gray-100">{m.selisih}</td>
                                                <td className="px-3 py-2 text-center border-r border-gray-100">
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                                                        {m.status}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-2 text-center" onClick={e => e.stopPropagation()}>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenMonthlyModal(m)}
                                                        className="px-2 py-0.5 text-[11px] bg-gray-100 hover:bg-emerald-100 hover:text-emerald-800 text-gray-700 rounded border border-gray-300 font-bold transition"
                                                        title="Lihat Detail Bulan"
                                                    >
                                                        👁️ View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Footer 3 Panels */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            {/* Rekap Budget per Department */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                                <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
                                    <h2 className="font-bold text-gray-800 text-sm tracking-tight">Rekap Budget per Department</h2>
                                </div>
                                <div className="p-3">
                                    <table className="w-full text-xs text-left">
                                        <thead className="bg-gray-50/50 text-gray-600 border-b border-gray-100">
                                            <tr>
                                                <th className="py-1 font-bold">No</th>
                                                <th className="py-1 font-bold">Department</th>
                                                <th className="py-1 font-bold text-right">Forecast (Rp)</th>
                                                <th className="py-1 font-bold text-center">Persentase</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 text-gray-600">
                                            {rekapDepartment.map((item) => (
                                                <tr key={item.no}>
                                                    <td className="py-1">{item.no}</td>
                                                    <td className="py-1 font-medium">{item.dept}</td>
                                                    <td className="py-1 text-right font-mono">{item.forecast}</td>
                                                    <td className="py-1 text-center font-bold text-gray-700">{item.pct}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="border-t border-gray-200 font-bold text-gray-900">
                                            <tr>
                                                <td colSpan="2" className="py-1">Total</td>
                                                <td className="py-1 text-right font-mono">12,650,000,000</td>
                                                <td className="py-1 text-center">100%</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                            {/* Rekap Budget per Kategori */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                                <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
                                    <h2 className="font-bold text-gray-800 text-sm tracking-tight">Rekap Budget per Kategori</h2>
                                </div>
                                <div className="p-3">
                                    <table className="w-full text-xs text-left">
                                        <thead className="bg-gray-50/50 text-gray-600 border-b border-gray-100">
                                            <tr>
                                                <th className="py-1 font-bold">No</th>
                                                <th className="py-1 font-bold">Kategori</th>
                                                <th className="py-1 font-bold text-right">Forecast (Rp)</th>
                                                <th className="py-1 font-bold text-center">Persentase</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 text-gray-600">
                                            {rekapKategori.map((item) => (
                                                <tr key={item.no}>
                                                    <td className="py-1">{item.no}</td>
                                                    <td className="py-1 font-medium">{item.kategori}</td>
                                                    <td className="py-1 text-right font-mono">{item.forecast}</td>
                                                    <td className="py-1 text-center font-bold text-gray-700">{item.pct}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="border-t border-gray-200 font-bold text-gray-900">
                                            <tr>
                                                <td colSpan="2" className="py-1">Total</td>
                                                <td className="py-1 text-right font-mono">12,650,000,000</td>
                                                <td className="py-1 text-center">100%</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                            {/* Catatan & Rekomendasi */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                                <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
                                    <h2 className="font-bold text-gray-800 text-sm tracking-tight">Catatan & Rekomendasi</h2>
                                </div>
                                <div className="p-4 flex-1 flex flex-col justify-center">
                                    <ul className="space-y-3">
                                        <li className="flex items-start gap-2">
                                            <div className="bg-[#10b981] text-white rounded-full p-0.5 mt-0.5 flex-shrink-0"><svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></div>
                                            <span className="text-xs text-gray-700">Forecast disusun berdasarkan historis 3 tahun terakhir</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <div className="bg-[#10b981] text-white rounded-full p-0.5 mt-0.5 flex-shrink-0"><svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></div>
                                            <span className="text-xs text-gray-700">Pertimbangkan kenaikan harga sparepart ±5-10%</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <div className="bg-[#10b981] text-white rounded-full p-0.5 mt-0.5 flex-shrink-0"><svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></div>
                                            <span className="text-xs text-gray-700">Monitor realisasi setiap bulan untuk penyesuaian</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <div className="bg-[#10b981] text-white rounded-full p-0.5 mt-0.5 flex-shrink-0"><svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></div>
                                            <span className="text-xs text-gray-700">Fokus pada peningkatan PM untuk menurunkan biaya corrective</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    /* UNIT / CATEGORY TABS */
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between flex-wrap gap-2">
                            <div>
                                <h2 className="font-black text-gray-900 text-sm tracking-tight flex items-center gap-2">
                                    <span>Rincian Budget Forecast ({activeTab})</span>
                                    <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                                        {filteredUnitBlocks.reduce((sum, b) => sum + (b.items ? b.items.length : 0), 0)} Items
                                    </span>
                                </h2>
                                <p className="text-[11px] text-gray-500 mt-0.5">
                                    💡 <em>Double-klik baris item mana saja untuk melihat detail atau mengedit data.</em>
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                                    Double-Klik Aktif ✓
                                </span>
                                <button
                                    type="button"
                                    onClick={() => handleOpenAddModal(activeTab)}
                                    className="bg-[#10b981] hover:bg-[#059669] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                                >
                                    <span>+ Add Entry ({activeTab})</span>
                                </button>
                            </div>
                        </div>

                        {/* Search & Unit Filter for Unit Tab */}
                        <div className="p-3 border-b border-gray-100 bg-slate-50/50 flex flex-wrap items-center gap-3">
                            {/* Unit Quick Filter Dropdown */}
                            {availableUnitsInTab.length > 1 && (
                                <div className="flex items-center gap-1.5">
                                    <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">Unit:</label>
                                    <select
                                        value={selectedUnitFilter}
                                        onChange={e => setSelectedUnitFilter(e.target.value)}
                                        className="text-xs font-bold border border-gray-300 rounded-lg px-2 py-1.5 bg-white text-gray-800 focus:ring-[#10b981] focus:border-[#10b981]"
                                    >
                                        <option value="ALL">Semua Unit ({availableUnitsInTab.length} Unit)</option>
                                        {availableUnitsInTab.map((u, i) => (
                                            <option key={i} value={u.code_unit}>
                                                {u.code_unit} {u.type_unit ? `— ${u.type_unit}` : ''} ({u.itemCount} item)
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="relative flex-1 min-w-[200px] max-w-md">
                                <input 
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder={`Filter item di tab ${activeTab}...`}
                                    className="w-full text-xs border border-gray-300 rounded-lg pl-7 pr-3 py-1.5 focus:ring-[#10b981] focus:border-[#10b981]"
                                />
                                <svg className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            </div>
                            {(searchQuery || selectedUnitFilter !== 'ALL') && (
                                <button
                                    type="button"
                                    onClick={() => { setSearchQuery(''); setSelectedUnitFilter('ALL'); }}
                                    className="text-xs text-gray-500 hover:text-gray-800 underline font-semibold"
                                >
                                    Reset Filter
                                </button>
                            )}
                        </div>

                        <div className="p-0 overflow-x-auto">
                            {filteredUnitBlocks.length === 0 ? (
                                <div className="p-8 text-center text-gray-400 text-xs font-semibold">
                                    Tidak ada item ditemukan {searchQuery ? `untuk pencarian "${searchQuery}"` : ''}.
                                </div>
                            ) : (
                                filteredUnitBlocks.map((unitBlock, uIdx) => (
                                    <div key={uIdx} className="mb-6 last:mb-0">
                                        {/* Unit Header Bar */}
                                        <div className="bg-yellow-300 px-4 py-1.5 flex flex-wrap items-center justify-between text-xs font-bold border-b border-gray-300 shadow-xs">
                                            <div className="flex items-center gap-6">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-700 uppercase tracking-wide text-[10px]">Code unit:</span>
                                                    <span className="font-mono text-gray-900 font-black">{unitBlock.code_unit}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-700 uppercase tracking-wide text-[10px]">Type Unit:</span>
                                                    <span className="text-gray-900">{unitBlock.type_unit || '-'}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-700 uppercase tracking-wide text-[10px]">HM:</span>
                                                    <span className="font-mono text-gray-900">{unitBlock.hm || '-'}</span>
                                                </div>
                                            </div>
                                            <div className="text-[11px] text-yellow-900 font-medium">
                                                {unitBlock.items ? unitBlock.items.length : 0} items
                                            </div>
                                        </div>

                                        {/* Table */}
                                        <table className="w-full text-xs text-left whitespace-nowrap border-collapse">
                                            <thead className="bg-gray-200 text-gray-800 border-y border-gray-300">
                                                <tr>
                                                    <th className="px-3 py-2 font-bold text-center border-r border-gray-300 w-10">No.</th>
                                                    <th className="px-3 py-2 font-bold border-r border-gray-300 w-24">Code Budget</th>
                                                    <th className="px-3 py-2 font-bold border-r border-gray-300 w-32">Cost Element</th>
                                                    <th className="px-3 py-2 font-bold border-r border-gray-300 w-32">Code Depart</th>
                                                    <th className="px-3 py-2 font-bold border-r border-gray-300 min-w-[240px]">Uraian</th>
                                                    <th className="px-3 py-2 font-bold text-center border-r border-gray-300 w-16">Standart QTY</th>
                                                    <th className="px-3 py-2 font-bold text-center border-r border-gray-300 w-16 bg-blue-50/60 text-blue-900">Forecast QTY</th>
                                                    <th className="px-3 py-2 font-bold text-center border-r border-gray-300 w-16">Satuan</th>
                                                    <th className="px-3 py-2 font-bold text-right border-r border-gray-300 w-28">Unit Rate</th>
                                                    <th className="px-3 py-2 font-bold text-right border-r border-gray-300 w-32 bg-emerald-50/50 text-emerald-900">Amount</th>
                                                    <th className="px-2 py-2 font-bold text-center w-16">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 text-gray-700">
                                                {unitBlock.items && unitBlock.items.map((item, iIdx) => (
                                                    <tr 
                                                        key={item.id || iIdx} 
                                                        onDoubleClick={() => handleOpenItemModal(item, unitBlock, activeTab)}
                                                        className="hover:bg-emerald-50/70 transition-colors cursor-pointer group select-none"
                                                        title="Double-klik untuk melihat detail atau mengedit entry ini"
                                                    >
                                                        <td className="px-3 py-1.5 text-center border-r border-gray-200 text-gray-400 font-mono">{item.no || (iIdx + 1)}</td>
                                                        <td className="px-3 py-1.5 border-r border-gray-200 font-mono text-[11px] font-bold text-gray-800">{item.code_budget}</td>
                                                        <td className="px-3 py-1.5 border-r border-gray-200 font-semibold">{item.cost_element}</td>
                                                        <td className="px-3 py-1.5 border-r border-gray-200 font-mono text-[11px] text-gray-600">{item.code_depart}</td>
                                                        <td className="px-3 py-1.5 border-r border-gray-200 font-medium text-gray-900 max-w-[340px] truncate" title={item.uraian}>
                                                            {item.uraian || '-'}
                                                        </td>
                                                        <td className="px-3 py-1.5 text-center border-r border-gray-200">{item.std_qty || '-'}</td>
                                                        <td className="px-3 py-1.5 text-center border-r border-gray-200 font-bold text-blue-700 bg-blue-50/20">
                                                            {item.forecast_qty || <span className="text-gray-300 font-normal">-</span>}
                                                        </td>
                                                        <td className="px-3 py-1.5 text-center border-r border-gray-200">{item.satuan}</td>
                                                        <td className="px-3 py-1.5 text-right font-mono border-r border-gray-200">
                                                            Rp {Number(item.unit_rate || 0).toLocaleString('id-ID')}
                                                        </td>
                                                        <td className="px-3 py-1.5 text-right font-mono font-black text-emerald-800 bg-emerald-50/20 border-r border-gray-200">
                                                            {Number(item.amount || 0) > 0 ? `Rp ${Number(item.amount).toLocaleString('id-ID')}` : <span className="text-gray-400 font-normal">Rp 0</span>}
                                                        </td>
                                                        <td className="px-2 py-1 text-center" onClick={e => e.stopPropagation()}>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOpenItemModal(item, unitBlock, activeTab)}
                                                                className="px-2 py-0.5 text-[11px] bg-white hover:bg-emerald-100 text-gray-700 hover:text-emerald-800 border border-gray-300 hover:border-emerald-300 rounded font-bold transition shadow-2xs"
                                                                title="Lihat / Edit Entry"
                                                            >
                                                                ✏️ Edit
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot className="bg-gray-200 border-y border-gray-300 text-gray-800 font-bold">
                                                <tr>
                                                    <td colSpan="9" className="px-3 py-2 text-center border-r border-gray-300 font-black">Grand Total</td>
                                                    <td className="px-3 py-2 text-right font-mono font-black text-emerald-900 border-r border-gray-300">
                                                        Rp {Number((unitBlock.items || []).reduce((sum, item) => sum + (Number(item.amount) || 0), 0)).toLocaleString('id-ID')}
                                                    </td>
                                                    <td className="bg-gray-200"></td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* MODAL: VIEW & EDIT ENTRY */}
                {itemModal.isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-fadeIn">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
                            
                            {/* Modal Header */}
                            <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs bg-emerald-600/60 text-emerald-100 font-black px-2 py-0.5 rounded uppercase">
                                            {itemModal.tab}
                                        </span>
                                        <span className="text-xs bg-teal-600/60 text-teal-100 font-mono font-black px-2 py-0.5 rounded">
                                            {itemModal.unitCode}
                                        </span>
                                    </div>
                                    <h3 className="text-base font-black tracking-tight mt-1">
                                        {itemModal.mode === 'view' ? 'Detail Entry Forecast Budget' : 'Edit Entry Forecast Budget'}
                                    </h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="bg-emerald-950/40 p-1 rounded-lg flex items-center text-xs font-bold">
                                        <button
                                            type="button"
                                            onClick={() => setItemModal(prev => ({ ...prev, mode: 'view' }))}
                                            className={`px-3 py-1 rounded transition ${itemModal.mode === 'view' ? 'bg-white text-emerald-900 font-black shadow-xs' : 'text-emerald-200 hover:text-white'}`}
                                        >
                                            👁️ View
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setItemModal(prev => ({ ...prev, mode: 'edit' }))}
                                            className={`px-3 py-1 rounded transition ${itemModal.mode === 'edit' ? 'bg-white text-emerald-900 font-black shadow-xs' : 'text-emerald-200 hover:text-white'}`}
                                        >
                                            ✏️ Edit
                                        </button>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setItemModal(prev => ({ ...prev, isOpen: false }))}
                                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm transition"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
                                {itemModal.mode === 'view' ? (
                                    /* VIEW MODE */
                                    <div className="space-y-4">
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                                            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Uraian / Deskripsi Item</div>
                                            <div className="text-sm font-black text-gray-900 leading-relaxed">
                                                {itemModal.formData.uraian || '-'}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                                <div className="text-[10px] font-bold text-gray-400 uppercase">Code Budget</div>
                                                <div className="font-mono font-bold text-gray-800 mt-0.5">{itemModal.formData.code_budget || '-'}</div>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                                <div className="text-[10px] font-bold text-gray-400 uppercase">Cost Element</div>
                                                <div className="font-bold text-gray-800 mt-0.5">{itemModal.formData.cost_element || '-'}</div>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                                <div className="text-[10px] font-bold text-gray-400 uppercase">Code Depart / Part</div>
                                                <div className="font-mono font-bold text-gray-800 mt-0.5">{itemModal.formData.code_depart || '-'}</div>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                                <div className="text-[10px] font-bold text-gray-400 uppercase">Standart QTY</div>
                                                <div className="font-bold text-gray-800 mt-0.5">{itemModal.formData.std_qty || '-'}</div>
                                            </div>
                                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                                <div className="text-[10px] font-bold text-blue-600 uppercase">Forecast QTY</div>
                                                <div className="font-black text-blue-900 mt-0.5 text-sm">
                                                    {itemModal.formData.forecast_qty ? `${itemModal.formData.forecast_qty} ${itemModal.formData.satuan}` : '-'}
                                                </div>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                                <div className="text-[10px] font-bold text-gray-400 uppercase">Satuan</div>
                                                <div className="font-bold text-gray-800 mt-0.5">{itemModal.formData.satuan || '-'}</div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 pt-2">
                                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                                <div className="text-[10px] font-bold text-gray-400 uppercase">Harga Satuan (Unit Rate)</div>
                                                <div className="text-base font-black font-mono text-gray-900 mt-1">
                                                    Rp {Number(itemModal.formData.unit_rate || 0).toLocaleString('id-ID')}
                                                </div>
                                            </div>
                                            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                                                <div className="text-[10px] font-bold text-emerald-700 uppercase">Total Nominal (Amount)</div>
                                                <div className="text-lg font-black font-mono text-emerald-900 mt-1">
                                                    Rp {Number(itemModal.formData.amount || 0).toLocaleString('id-ID')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* EDIT MODE FORM */
                                    <form id="edit-item-form" onSubmit={handleUpdateItem} className="space-y-3">
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Code Budget</label>
                                                <input 
                                                    type="text"
                                                    value={itemModal.formData.code_budget}
                                                    onChange={e => setItemModal(prev => ({ ...prev, formData: { ...prev.formData, code_budget: e.target.value } }))}
                                                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs font-mono font-bold"
                                                    placeholder="3.0.13"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Cost Element</label>
                                                <input 
                                                    type="text"
                                                    value={itemModal.formData.cost_element}
                                                    onChange={e => setItemModal(prev => ({ ...prev, formData: { ...prev.formData, cost_element: e.target.value } }))}
                                                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs font-bold"
                                                    placeholder="Tools / PM Service / Oil"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Code Depart / Part No</label>
                                                <input 
                                                    type="text"
                                                    value={itemModal.formData.code_depart}
                                                    onChange={e => setItemModal(prev => ({ ...prev, formData: { ...prev.formData, code_depart: e.target.value } }))}
                                                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs font-mono font-bold"
                                                    placeholder="Part Number"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Uraian / Deskripsi Item *</label>
                                            <textarea 
                                                rows={2}
                                                required
                                                value={itemModal.formData.uraian}
                                                onChange={e => setItemModal(prev => ({ ...prev, formData: { ...prev.formData, uraian: e.target.value } }))}
                                                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs font-medium"
                                                placeholder="Nama alat, sparepart, atau deskripsi pekerjaan..."
                                            />
                                        </div>

                                        <div className="grid grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Standart QTY</label>
                                                <input 
                                                    type="text"
                                                    value={itemModal.formData.std_qty}
                                                    onChange={e => setItemModal(prev => ({ ...prev, formData: { ...prev.formData, std_qty: e.target.value } }))}
                                                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs text-center font-bold"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Forecast QTY *</label>
                                                <input 
                                                    type="number"
                                                    step="any"
                                                    required
                                                    value={itemModal.formData.forecast_qty}
                                                    onChange={e => {
                                                        const qty = e.target.value;
                                                        const rate = itemModal.formData.unit_rate;
                                                        const amt = qty && rate ? Math.round(parseFloat(qty) * parseFloat(rate)) : itemModal.formData.amount;
                                                        setItemModal(prev => ({ ...prev, formData: { ...prev.formData, forecast_qty: qty, amount: amt } }));
                                                    }}
                                                    className="w-full px-2.5 py-1.5 border border-blue-400 bg-blue-50/40 rounded-lg text-xs text-center font-black text-blue-900"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Satuan</label>
                                                <input 
                                                    type="text"
                                                    value={itemModal.formData.satuan}
                                                    onChange={e => setItemModal(prev => ({ ...prev, formData: { ...prev.formData, satuan: e.target.value } }))}
                                                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs text-center font-bold"
                                                    placeholder="Pcs / Set / Liter"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 pt-1">
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Unit Rate (Rp) *</label>
                                                <input 
                                                    type="number"
                                                    step="any"
                                                    required
                                                    value={itemModal.formData.unit_rate}
                                                    onChange={e => {
                                                        const rate = e.target.value;
                                                        const qty = itemModal.formData.forecast_qty;
                                                        const amt = qty && rate ? Math.round(parseFloat(qty) * parseFloat(rate)) : itemModal.formData.amount;
                                                        setItemModal(prev => ({ ...prev, formData: { ...prev.formData, unit_rate: rate, amount: amt } }));
                                                    }}
                                                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs font-mono font-bold"
                                                    placeholder="0"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-emerald-800 uppercase mb-1">Total Amount (Rp)</label>
                                                <input 
                                                    type="number"
                                                    step="any"
                                                    value={itemModal.formData.amount}
                                                    onChange={e => setItemModal(prev => ({ ...prev, formData: { ...prev.formData, amount: e.target.value } }))}
                                                    className="w-full px-2.5 py-1.5 border border-emerald-400 bg-emerald-50/50 rounded-lg text-xs font-mono font-black text-emerald-950"
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>
                                    </form>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                                <div>
                                    {itemModal.item?.id && (
                                        <button
                                            type="button"
                                            onClick={handleDeleteItem}
                                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-xs font-bold transition cursor-pointer"
                                        >
                                            🗑️ Hapus Entry
                                        </button>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setItemModal(prev => ({ ...prev, isOpen: false }))}
                                        className="px-4 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-bold transition cursor-pointer"
                                    >
                                        Tutup
                                    </button>
                                    {itemModal.mode === 'view' ? (
                                        <button
                                            type="button"
                                            onClick={() => setItemModal(prev => ({ ...prev, mode: 'edit' }))}
                                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                                        >
                                            ✏️ Edit Data
                                        </button>
                                    ) : (
                                        <button
                                            type="submit"
                                            form="edit-item-form"
                                            className="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black transition shadow-xs cursor-pointer"
                                        >
                                            💾 Simpan Perubahan
                                        </button>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                )}

                {/* MODAL: ADD ENTRY */}
                {addModal.isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-fadeIn">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
                            
                            {/* Header */}
                            <div className="px-6 py-4 bg-gradient-to-r from-emerald-700 to-green-700 text-white flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                                        +
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black tracking-tight">Tambah Entry Forecast Budget</h3>
                                        <p className="text-[11px] text-emerald-100">Tambahkan kebutuhan alat, komponen, atau service ke forecast budget</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setAddModal(prev => ({ ...prev, isOpen: false }))}
                                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm transition"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Form Body */}
                            <form id="add-item-form" onSubmit={handleStoreItem} className="p-6 overflow-y-auto flex-1 space-y-3.5 text-xs">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {/* Tab / Kategori */}
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                                            Kategori / Tab <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={addModal.formData.tab}
                                            onChange={e => {
                                                const val = e.target.value;
                                                const tabUnits = getUnitsForTab(val);
                                                const defaultCode = tabUnits.length > 0 ? tabUnits[0].code_unit : (pdfData?.[val]?.[0]?.code_unit || val);
                                                const defaultType = tabUnits.length > 0 ? (tabUnits[0].type_unit || tabUnits[0].model) : (pdfData?.[val]?.[0]?.type_unit || '');
                                                const defaultHm = tabUnits.length > 0 ? (tabUnits[0].hm || '') : (pdfData?.[val]?.[0]?.hm || '');
                                                const isEquipment = ['BULLDOZER', 'EXCAVATOR', 'DUMP TRUCK', 'DEWATERING', 'OHT', 'CAT 14', 'GD755-5R', 'SEM 922 AWD', 'COMPACTOR SSR220C'].includes(val.toUpperCase());

                                                setAddModal(prev => ({
                                                    ...prev,
                                                    formData: {
                                                        ...prev.formData,
                                                        tab: val,
                                                        code_unit: defaultCode,
                                                        type_unit: defaultType,
                                                        hm: defaultHm,
                                                        cost_element: isEquipment ? 'PM Service' : (val === 'TOOLS' ? 'Tools' : 'Others'),
                                                    }
                                                }));
                                            }}
                                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs font-bold"
                                            required
                                        >
                                            {pdfTabs.map(tab => (
                                                <option key={tab} value={tab}>{getTabIcon(tab)} {tab}</option>
                                            ))}
                                            <option value="__NEW__">➕ Tambah Kategori Baru...</option>
                                        </select>
                                    </div>

                                    {/* Custom Tab if selected __NEW__ */}
                                    {addModal.formData.tab === '__NEW__' ? (
                                        <div>
                                            <label className="block text-[10px] font-bold text-emerald-700 uppercase mb-1">Nama Kategori Baru *</label>
                                            <input 
                                                type="text"
                                                required
                                                value={addModal.formData.custom_tab}
                                                onChange={e => setAddModal(prev => ({ ...prev, formData: { ...prev.formData, custom_tab: e.target.value } }))}
                                                className="w-full px-2.5 py-1.5 border border-emerald-400 bg-emerald-50/30 rounded-lg text-xs font-bold"
                                                placeholder="Contoh: LIGHTING TOWER"
                                            />
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                                                Kode Unit / Referensi <span className="text-red-500">*</span>
                                            </label>
                                            <input 
                                                type="text"
                                                list="add-modal-units-list"
                                                required
                                                value={addModal.formData.code_unit}
                                                onChange={e => handleUnitCodeChange(e.target.value)}
                                                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs font-mono font-bold"
                                                placeholder="Pilih atau ketik kode unit..."
                                            />
                                            <datalist id="add-modal-units-list">
                                                {getUnitsForTab(addModal.formData.tab).map((u, i) => (
                                                    <option key={i} value={u.code_unit}>
                                                        {u.code_unit} — {u.type_unit || u.model || ''} {u.hm ? `(HM: ${u.hm})` : ''}
                                                    </option>
                                                ))}
                                            </datalist>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Tipe Unit (Opsional)</label>
                                        <input 
                                            type="text"
                                            value={addModal.formData.type_unit}
                                            onChange={e => setAddModal(prev => ({ ...prev, formData: { ...prev.formData, type_unit: e.target.value } }))}
                                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs"
                                            placeholder="Contoh: WATER PUMP-Flugo"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">HM Unit (Opsional)</label>
                                        <input 
                                            type="text"
                                            value={addModal.formData.hm}
                                            onChange={e => setAddModal(prev => ({ ...prev, formData: { ...prev.formData, hm: e.target.value } }))}
                                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs font-mono"
                                            placeholder="Contoh: 1540"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Code Budget</label>
                                        <input 
                                            type="text"
                                            value={addModal.formData.code_budget}
                                            onChange={e => setAddModal(prev => ({ ...prev, formData: { ...prev.formData, code_budget: e.target.value } }))}
                                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs font-mono font-bold"
                                            placeholder="3.0.13"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Cost Element</label>
                                        <input 
                                            type="text"
                                            value={addModal.formData.cost_element}
                                            onChange={e => setAddModal(prev => ({ ...prev, formData: { ...prev.formData, cost_element: e.target.value } }))}
                                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs font-bold"
                                            placeholder="Tools / PM Service / Oil"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Code Depart / Part No</label>
                                        <input 
                                            type="text"
                                            value={addModal.formData.code_depart}
                                            onChange={e => setAddModal(prev => ({ ...prev, formData: { ...prev.formData, code_depart: e.target.value } }))}
                                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs font-mono"
                                            placeholder="Part Number"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                                        Uraian / Deskripsi Item <span className="text-red-500">*</span>
                                    </label>
                                    <textarea 
                                        rows={2}
                                        required
                                        value={addModal.formData.uraian}
                                        onChange={e => setAddModal(prev => ({ ...prev, formData: { ...prev.formData, uraian: e.target.value } }))}
                                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs font-medium"
                                        placeholder="Nama alat, komponen, suku cadang, atau deskripsi pekerjaan..."
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Standart QTY</label>
                                        <input 
                                            type="text"
                                            value={addModal.formData.std_qty}
                                            onChange={e => setAddModal(prev => ({ ...prev, formData: { ...prev.formData, std_qty: e.target.value } }))}
                                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs text-center font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                                            Forecast QTY <span className="text-red-500">*</span>
                                        </label>
                                        <input 
                                            type="number"
                                            step="any"
                                            required
                                            value={addModal.formData.forecast_qty}
                                            onChange={e => {
                                                const qty = e.target.value;
                                                const rate = addModal.formData.unit_rate;
                                                const amt = qty && rate ? Math.round(parseFloat(qty) * parseFloat(rate)) : addModal.formData.amount;
                                                setAddModal(prev => ({ ...prev, formData: { ...prev.formData, forecast_qty: qty, amount: amt } }));
                                            }}
                                            className="w-full px-2.5 py-1.5 border border-blue-400 bg-blue-50/40 rounded-lg text-xs text-center font-black text-blue-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Satuan</label>
                                        <input 
                                            type="text"
                                            value={addModal.formData.satuan}
                                            onChange={e => setAddModal(prev => ({ ...prev, formData: { ...prev.formData, satuan: e.target.value } }))}
                                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs text-center font-bold"
                                            placeholder="Pcs / Set / Liter"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-1">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">Unit Rate (Rp) *</label>
                                        <input 
                                            type="number"
                                            step="any"
                                            required
                                            value={addModal.formData.unit_rate}
                                            onChange={e => {
                                                const rate = e.target.value;
                                                const qty = addModal.formData.forecast_qty;
                                                const amt = qty && rate ? Math.round(parseFloat(qty) * parseFloat(rate)) : addModal.formData.amount;
                                                setAddModal(prev => ({ ...prev, formData: { ...prev.formData, unit_rate: rate, amount: amt } }));
                                            }}
                                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs font-mono font-bold"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-emerald-800 uppercase mb-1">Total Amount (Rp)</label>
                                        <input 
                                            type="number"
                                            step="any"
                                            value={addModal.formData.amount}
                                            onChange={e => setAddModal(prev => ({ ...prev, formData: { ...prev.formData, amount: e.target.value } }))}
                                            className="w-full px-2.5 py-1.5 border border-emerald-400 bg-emerald-50/50 rounded-lg text-xs font-mono font-black text-emerald-950"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            </form>

                            {/* Footer */}
                            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setAddModal(prev => ({ ...prev, isOpen: false }))}
                                    className="px-4 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-bold transition cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    form="add-item-form"
                                    className="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black transition shadow-xs cursor-pointer"
                                >
                                    💾 Simpan Entry
                                </button>
                            </div>

                        </div>
                    </div>
                )}

                {/* MODAL: MONTHLY DETAIL */}
                {monthlyModal.isOpen && monthlyModal.data && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-fadeIn">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100">
                            <div className="px-6 py-4 bg-emerald-800 text-white flex items-center justify-between">
                                <h3 className="text-sm font-black flex items-center gap-2">
                                    <span>Detail Forecast Bulan {monthlyModal.data.bulan} (2026)</span>
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setMonthlyModal({ isOpen: false, data: null })}
                                    className="text-white hover:bg-white/20 w-7 h-7 rounded-full flex items-center justify-center"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="p-6 space-y-3 text-xs">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                                        <div className="text-[10px] font-bold text-gray-500 uppercase">Planned Maintenance</div>
                                        <div className="font-mono font-bold text-gray-900 mt-1">Rp {monthlyModal.data.planned}</div>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                                        <div className="text-[10px] font-bold text-gray-500 uppercase">Corrective Maintenance</div>
                                        <div className="font-mono font-bold text-gray-900 mt-1">Rp {monthlyModal.data.corrective}</div>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                                        <div className="text-[10px] font-bold text-gray-500 uppercase">Project / Improvement</div>
                                        <div className="font-mono font-bold text-gray-900 mt-1">Rp {monthlyModal.data.project}</div>
                                    </div>
                                    <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                                        <div className="text-[10px] font-bold text-emerald-700 uppercase">Total Forecast Budget</div>
                                        <div className="font-mono font-black text-emerald-900 mt-1">Rp {monthlyModal.data.total}</div>
                                    </div>
                                </div>
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                                    <div>
                                        <div className="text-[10px] font-bold text-blue-700 uppercase">Realisasi</div>
                                        <div className="font-mono font-black text-blue-950 mt-0.5">Rp {monthlyModal.data.realisasi}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-bold text-blue-700 uppercase">Selisih vs Target</div>
                                        <div className="font-bold text-emerald-700 mt-0.5">{monthlyModal.data.selisih} ({monthlyModal.data.status})</div>
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-right">
                                <button
                                    type="button"
                                    onClick={() => setMonthlyModal({ isOpen: false, data: null })}
                                    className="px-4 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-bold transition"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </AuthenticatedLayout>
    );
}
