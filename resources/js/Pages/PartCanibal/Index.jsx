import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import PartCanibalTab from '../MonitoringOrder/PartCanibalTab';

export default function Index({ canibals, stats, units }) {
    return (
        <AuthenticatedLayout header="Monitoring Part Canibal">
            <Head title="Monitoring Part Canibal" />
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <PartCanibalTab canibals={canibals} stats={stats} units={units} />
            </div>
        </AuthenticatedLayout>
    );
}
