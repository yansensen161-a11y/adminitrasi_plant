import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import StatCard from '@/Components/Dashboard/StatCard';
import React from 'react';

export default function Dashboard() {
    const { kpi } = usePage().props;

    const cards = [
        {
            id: 'total-unit',
            title: "Total Unit", 
            value: kpi?.total_unit || 0, 
            change: "Stable", 
            isPositive: true, 
            colorClass: "text-blue-600",
            icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" /></svg>
        },
        {
            id: 'total-mekanik',
            title: "Total Mekanik", 
            value: kpi?.total_mekanik || 0, 
            change: "Active", 
            isPositive: true, 
            colorClass: "text-primary-600",
            icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
        },
        {
            id: 'breakdown',
            title: "Breakdown", 
            value: kpi?.breakdown || 0, 
            change: "Requires Action", 
            isPositive: false, 
            colorClass: "text-red-600",
            icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        },
        {
            id: 'open-wo',
            title: "Open WO", 
            value: kpi?.open_wo || 0, 
            change: "Pending", 
            isPositive: false, 
            colorClass: "text-amber-500",
            icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        },
        {
            id: 'on-process',
            title: "On Process", 
            value: kpi?.on_process_wo || 0, 
            change: "Working", 
            isPositive: true, 
            colorClass: "text-sky-500",
            icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        },
        {
            id: 'closed',
            title: "Closed WO", 
            value: kpi?.closed_wo || 0, 
            change: "Done", 
            isPositive: true, 
            colorClass: "text-green-600",
            icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        },
        {
            id: 'backlog',
            title: "Backlog", 
            value: kpi?.backlog || 0, 
            change: "Queue", 
            isPositive: false, 
            colorClass: "text-orange-500",
            icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
        },
        {
            id: 'pm-due',
            title: "PM Due", 
            value: kpi?.pm_due || 0, 
            change: "Schedule", 
            isPositive: false, 
            colorClass: "text-red-500",
            icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        }
    ];

    return (
        <AuthenticatedLayout header="Dashboard" children={
            <>
                <Head title="Plant Maintenance System" />
                
                <div className="mb-6">
                    <p className="text-slate-500">Real-time overview of Plant Maintenance Operations.</p>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {cards.map(card => (
                        <StatCard key={card.id} {...card} />
                    ))}
                </div>

                {/* Additional Placeholder for Charts / Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                     <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-center min-h-[300px]">
                        <div className="text-center">
                            <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                            <h3 className="text-lg font-medium text-slate-700">Performance Chart (Coming Soon)</h3>
                            <p className="text-slate-400 mt-1">Maintenance trends will appear here.</p>
                        </div>
                     </div>
                     <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-center min-h-[300px]">
                        <div className="text-center">
                             <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                             <h3 className="text-lg font-medium text-slate-700">Recent Activity</h3>
                             <p className="text-slate-400 mt-1">Latest updates will be listed here.</p>
                        </div>
                     </div>
                </div>
            </>
        } />
    );
}
