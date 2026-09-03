import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import StatCard from '@/Components/Dashboard/StatCard';
import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Wrapper component for sortable item
function SortableCard({ id, cardData }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        zIndex: isDragging ? 10 : 1,
        position: 'relative',
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none">
            <StatCard {...cardData} />
        </div>
    );
}

// Initial data for cards
const initialCards = [
    {
        id: 'total-requests',
        title: "Total Requests", value: "24.58M", change: "↑ 18.2%", isPositive: true, colorClass: "text-blue-500",
        trendData: [30, 40, 35, 50, 49, 60, 70, 91, 125],
        icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
    },
    {
        id: 'successful-requests',
        title: "Successful Requests", value: "23.68M", change: "↑ 20.5%", isPositive: true, colorClass: "text-green-500",
        trendData: [20, 30, 25, 40, 45, 55, 65, 80, 110],
        icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    },
    {
        id: 'error-rate',
        title: "Error Rate", value: "0.89%", change: "↓ 8.7%", isPositive: true, colorClass: "text-red-500",
        trendData: [15, 12, 18, 10, 8, 9, 6, 5, 4],
        icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    },
    {
        id: 'avg-response',
        title: "Avg Response Time", value: "142ms", change: "↓ 12.3%", isPositive: true, colorClass: "text-yellow-500",
        trendData: [160, 155, 140, 145, 150, 135, 130, 120, 142],
        icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    },
    {
        id: 'active-apis',
        title: "Active APIs", value: "156", change: "↑ 7", isPositive: true, colorClass: "text-purple-500",
        trendData: [140, 142, 145, 144, 150, 152, 155, 154, 156],
        icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
    },
    {
        id: 'active-consumers',
        title: "Active Consumers", value: "2.43K", change: "↑ 11.3%", isPositive: true, colorClass: "text-cyan-500",
        trendData: [2.0, 2.1, 2.15, 2.2, 2.25, 2.3, 2.38, 2.4, 2.43],
        icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
    }
];

export default function Dashboard() {
    const lineChartRef = useRef(null);
    const doughnutChartRef = useRef(null);
    const [cards, setCards] = useState(initialCards);
    const [activeId, setActiveId] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            setCards((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
        setActiveId(null);
    };
    useEffect(() => {
        if (!lineChartRef.current) return;
        
        const ctx = lineChartRef.current.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.5)'); // Blue-500
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00', '00:00'],
                datasets: [{
                    label: 'Requests',
                    data: [500000, 450000, 300000, 800000, 1200000, 1450000, 1100000, 950000, 850000],
                    borderColor: '#3b82f6',
                    backgroundColor: gradient,
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#1e3a8a',
                    pointBorderColor: '#60a5fa',
                    pointBorderWidth: 2,
                    pointRadius: 3,
                    pointHoverRadius: 6,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleColor: '#94a3b8',
                        bodyColor: '#f8fafc',
                        borderColor: '#334155',
                        borderWidth: 1,
                        padding: 10,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return (context.parsed.y / 1000000).toFixed(2) + 'M Requests';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false, drawBorder: false },
                        ticks: { color: '#64748b' }
                    },
                    y: {
                        grid: { color: 'rgba(51, 65, 85, 0.5)', drawBorder: false, borderDash: [5, 5] },
                        ticks: {
                            color: '#64748b',
                            callback: function(value) {
                                if (value === 0) return '0';
                                return (value / 1000000) + 'M';
                            }
                        },
                        beginAtZero: true
                    }
                },
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
            }
        });

        return () => chart.destroy();
    }, []);

    // Doughnut Chart (Requests by API)
    useEffect(() => {
        if (!doughnutChartRef.current) return;
        
        const ctx = doughnutChartRef.current.getContext('2d');
        const chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['AI Chat Completion', 'Text Embedding API', 'Image Generation API', 'Speech to Text API', 'Text to Speech API', 'Others'],
                datasets: [{
                    data: [30.3, 21.6, 16.9, 12.1, 7.1, 11.9],
                    backgroundColor: [
                        '#3b82f6', // blue
                        '#10b981', // green
                        '#6366f1', // indigo
                        '#ec4899', // pink
                        '#f59e0b', // amber
                        '#64748b', // slate
                    ],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        bodyColor: '#f8fafc',
                        callbacks: {
                            label: function(context) {
                                return ` ${context.label}: ${context.parsed}%`;
                            }
                        }
                    }
                }
            }
        });

        return () => chart.destroy();
    }, []);

    return (
        <AuthenticatedLayout header="Overview Dashboard" children={
            <>
                <Head title="AI API Gateway" />
                
                {/* Dashboard wrapper to enforce extremely dark theme locally */}
                <div className="dark min-h-screen bg-[#0b0f19] text-gray-300 p-2 sm:p-4 rounded-2xl -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pb-12 mt-4 relative border border-gray-800 shadow-2xl">
                    <div className="absolute top-0 right-0 p-4 text-gray-500 text-sm flex items-center gap-2">
                        <span>Last 24 Hours</span>
                        <svg className="w-4 h-4 cursor-pointer hover:text-gray-300 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </div>

                    <div className="mb-6">
                        <p className="text-gray-400">Real-time overview of your API Gateway</p>
                    </div>

                    {/* Top Row: Metrics Cards (Draggable) */}
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext items={cards.map(c => c.id)} strategy={rectSortingStrategy}>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
                                {cards.map(card => (
                                    <SortableCard key={card.id} id={card.id} cardData={card} />
                                ))}
                            </div>
                        </SortableContext>
                        
                        {/* Overlay when dragging */}
                        <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: "0.5" } } }) }}>
                            {activeId ? (
                                <div className="scale-105 shadow-[0_0_30px_rgba(59,130,246,0.5)] rounded-xl opacity-90 cursor-grabbing">
                                    <StatCard {...cards.find(c => c.id === activeId)} />
                                </div>
                            ) : null}
                        </DragOverlay>
                    </DndContext>

                    {/* Middle Row: Charts & Top Consumers */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                        {/* Line Chart */}
                        <div className="glass-card bg-gray-900/50 dark:bg-gray-900/40 rounded-xl p-5 border border-gray-800 col-span-1 lg:col-span-2">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold text-gray-100">Request Volume</h2>
                                <select className="bg-gray-800 border-gray-700 text-sm text-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 py-1">
                                    <option>Total Requests</option>
                                    <option>Errors</option>
                                </select>
                            </div>
                            <div className="h-72">
                                <canvas ref={lineChartRef}></canvas>
                            </div>
                        </div>
                        
                        {/* Doughnut Chart & Legend */}
                        <div className="glass-card bg-gray-900/50 dark:bg-gray-900/40 rounded-xl p-5 border border-gray-800 flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold text-gray-100">Requests by API</h2>
                                <a href="#" className="text-sm text-gray-400 hover:text-white">View All</a>
                            </div>
                            <div className="flex-1 flex flex-col justify-center relative">
                                <div className="h-48 relative mb-4">
                                    <canvas ref={doughnutChartRef}></canvas>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-2xl font-bold text-gray-100">24.58M</span>
                                        <span className="text-xs text-gray-500">Total</span>
                                    </div>
                                </div>
                                <div className="space-y-2 mt-2">
                                    <div className="flex justify-between items-center text-xs">
                                        <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span><span className="text-gray-400">AI Chat Completion API</span></div>
                                        <div className="flex gap-2"><span className="text-gray-200">7.45M</span><span className="text-gray-500 w-10 text-right">(30.3%)</span></div>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span><span className="text-gray-400">Text Embedding API</span></div>
                                        <div className="flex gap-2"><span className="text-gray-200">5.32M</span><span className="text-gray-500 w-10 text-right">(21.6%)</span></div>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-teal-500 mr-2"></span><span className="text-gray-400">Image Gen API</span></div>
                                        <div className="flex gap-2"><span className="text-gray-200">4.15M</span><span className="text-gray-500 w-10 text-right">(16.9%)</span></div>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-pink-500 mr-2"></span><span className="text-gray-400">Speech to Text API</span></div>
                                        <div className="flex gap-2"><span className="text-gray-200">2.98M</span><span className="text-gray-500 w-10 text-right">(12.1%)</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Row: Tables & Lists */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        {/* Recent Activity Table */}
                        <div className="glass-card bg-gray-900/50 dark:bg-gray-900/40 rounded-xl p-5 border border-gray-800 col-span-1 lg:col-span-2">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold text-gray-100">Recent API Activity</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 uppercase bg-gray-800/50">
                                        <tr>
                                            <th className="px-4 py-3 font-medium rounded-l-lg">Time</th>
                                            <th className="px-4 py-3 font-medium">API</th>
                                            <th className="px-4 py-3 font-medium">Consumer</th>
                                            <th className="px-4 py-3 font-medium">Status</th>
                                            <th className="px-4 py-3 font-medium">Response Time</th>
                                            <th className="px-4 py-3 font-medium rounded-r-lg">IP Address</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { time: '2m ago', api: 'POST /v1/chat/completions', consumer: 'Acme Corporation', status: 200, rt: '120ms', ip: '203.0.113.25' },
                                            { time: '3m ago', api: 'POST /v1/embeddings', consumer: 'Globex Inc.', status: 200, rt: '58ms', ip: '198.51.100.42' },
                                            { time: '5m ago', api: 'POST /v1/images/generations', consumer: 'Stark Industries', status: 200, rt: '245ms', ip: '203.0.113.15' },
                                            { time: '7m ago', api: 'POST /v1/speech/transcriptions', consumer: 'Wayne Enterprises', status: 429, rt: '302ms', ip: '192.0.2.10', isError: true },
                                            { time: '8m ago', api: 'POST /v1/chat/completions', consumer: 'Acme Corporation', status: 200, rt: '110ms', ip: '203.0.113.25' },
                                        ].map((row, i) => (
                                            <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                                                <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{row.time}</td>
                                                <td className="px-4 py-3 text-gray-300 font-mono text-xs whitespace-nowrap">{row.api}</td>
                                                <td className="px-4 py-3 text-gray-300 whitespace-nowrap">{row.consumer}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${row.isError ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
                                                        {row.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{row.rt}</td>
                                                <td className="px-4 py-3 text-gray-500 font-mono text-xs whitespace-nowrap">{row.ip}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-4 text-center">
                                <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">View All Activity →</a>
                            </div>
                        </div>

                        {/* System Health */}
                        <div className="glass-card bg-gray-900/50 dark:bg-gray-900/40 rounded-xl p-5 border border-gray-800 flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold text-gray-100">System Health</h2>
                                <a href="#" className="text-sm text-gray-400 hover:text-white">View All</a>
                            </div>
                            <div className="space-y-3 flex-1">
                                {[
                                    { name: 'API Gateway Cluster', status: 'Healthy', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
                                    { name: 'Rate Limiting Service', status: 'Healthy', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
                                    { name: 'OAuth Service', status: 'Healthy', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
                                    { name: 'Analytics Service', status: 'Healthy', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
                                    { name: 'Log Aggregation', status: 'Healthy', icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4' },
                                ].map((item, i) => (
                                    <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-gray-800/30 border border-gray-800/50">
                                        <div className="flex items-center gap-3 text-sm text-gray-300">
                                            <div className="text-gray-500">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} /></svg>
                                            </div>
                                            {item.name}
                                        </div>
                                        <div className="flex items-center text-xs font-medium text-green-500">
                                            <span className="w-2 h-2 rounded-full bg-green-500 mr-2 status-online"></span>
                                            {item.status}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Alerts */}
                        <div className="glass-card bg-gray-900/50 dark:bg-gray-900/40 rounded-xl p-5 border border-gray-800 flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold text-gray-100">Alerts</h2>
                                <a href="#" className="text-sm text-gray-400 hover:text-white">View All</a>
                            </div>
                            <div className="space-y-3 flex-1">
                                {[
                                    { title: 'High Error Rate Detected', desc: 'AI Chat Completion API', time: '2m ago', type: 'error' },
                                    { title: 'Rate Limit Exceeded', desc: 'Consumer: Cyberdyne Systems', time: '5m ago', type: 'warning' },
                                    { title: 'Unusual Traffic Spike', desc: 'API: /v1/images/generations', time: '15m ago', type: 'warning' },
                                    { title: 'Failed Authentication Attempts', desc: 'Multiple consumers', time: '23m ago', type: 'error' },
                                ].map((alert, i) => (
                                    <div key={i} className={`p-3 rounded-lg border flex gap-3 ${alert.type === 'error' ? 'bg-red-500/5 border-red-500/20' : 'bg-amber-500/5 border-amber-500/20'}`}>
                                        <div className={`mt-0.5 ${alert.type === 'error' ? 'text-red-500' : 'text-amber-500'}`}>
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h4 className={`text-sm font-medium ${alert.type === 'error' ? 'text-red-200' : 'text-amber-200'}`}>{alert.title}</h4>
                                                <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{alert.time}</span>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1">{alert.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Left side panel info from image (Gateway Info) */}
                    <div className="absolute top-0 -left-64 w-60 hidden xl:flex flex-col gap-4 text-sm mt-4">
                        <div className="bg-gray-900/80 rounded-xl p-4 border border-gray-800 shadow-xl">
                            <h3 className="text-gray-400 font-medium mb-3">System</h3>
                            <div className="space-y-3">
                                <div className="flex items-center text-gray-300 gap-3 hover:text-white cursor-pointer"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg> Environments</div>
                                <div className="flex items-center text-gray-300 gap-3 hover:text-white cursor-pointer"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg> Clusters</div>
                                <div className="flex items-center text-gray-300 gap-3 hover:text-white cursor-pointer"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg> Audit Logs</div>
                                <div className="flex items-center text-gray-300 gap-3 hover:text-white cursor-pointer"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> Settings</div>
                            </div>
                        </div>

                        <div className="bg-gray-900/80 rounded-xl p-4 border border-gray-800 shadow-xl">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-2 h-2 rounded-full bg-green-500 status-online"></div>
                                <span className="text-gray-300 font-medium">System Status</span>
                            </div>
                            <div className="text-green-500 text-sm mb-4">Operational</div>
                            
                            <div className="flex justify-between text-xs text-gray-500 mb-2">
                                <span>Gateway Version</span>
                                <span className="text-gray-300">v2.4.1</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>Uptime</span>
                                <span className="text-gray-300">99.99%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        } />
    );
}
