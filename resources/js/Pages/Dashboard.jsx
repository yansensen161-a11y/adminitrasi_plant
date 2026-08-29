import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import FilterButton from '@/Components/Mosaic/DropdownFilter';
import Datepicker from '@/Components/Mosaic/Datepicker';
import DashboardCard01 from '@/Partials/dashboard/DashboardCard01';
import DashboardCard02 from '@/Partials/dashboard/DashboardCard02';
import DashboardCard03 from '@/Partials/dashboard/DashboardCard03';
import DashboardCard04 from '@/Partials/dashboard/DashboardCard04';
import DashboardCard05 from '@/Partials/dashboard/DashboardCard05';
import DashboardCard06 from '@/Partials/dashboard/DashboardCard06';
import DashboardCard07 from '@/Partials/dashboard/DashboardCard07';
import DashboardCard08 from '@/Partials/dashboard/DashboardCard08';
import DashboardCard09 from '@/Partials/dashboard/DashboardCard09';
import DashboardCard10 from '@/Partials/dashboard/DashboardCard10';
import DashboardCard11 from '@/Partials/dashboard/DashboardCard11';
import DashboardCard12 from '@/Partials/dashboard/DashboardCard12';
import DashboardCard13 from '@/Partials/dashboard/DashboardCard13';

export default function Dashboard() {
    return (
        <AuthenticatedLayout header="Dashboard">
            <Head title="Dashboard" />

            <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2 mb-8">
                {/* Filter button */}
                <FilterButton align="right" />
                {/* Datepicker built with React Day Picker */}
                <Datepicker align="right" />
                {/* Add view button */}
                <button className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white">
                    <svg className="fill-current shrink-0 xs:hidden" width="16" height="16" viewBox="0 0 16 16">
                        <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
                    </svg>
                    <span className="max-xs:sr-only">Add View</span>
                </button>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-12 gap-6">
                <DashboardCard01 />
                <DashboardCard02 />
                <DashboardCard03 />
                <DashboardCard04 />
                <DashboardCard05 />
                <DashboardCard06 />
                <DashboardCard07 />
                <DashboardCard08 />
                <DashboardCard09 />
                <DashboardCard10 />
                <DashboardCard11 />
                <DashboardCard12 />
                <DashboardCard13 />
            </div>
        </AuthenticatedLayout>
    );
}
