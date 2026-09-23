import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import Sidebar from '@/Partials/Sidebar';
import Header from '@/Partials/Header';
import PageLoader from '@/Components/PageLoader';
import AutoSaver from '@/Components/AutoSaver';

export default function AuthenticatedLayout({ header, children, fullWidth = false }) {
    const user = usePage().props.auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-transparent text-gray-800 dark:text-gray-300 font-sans antialiased selection:bg-green-500/30 selection:text-white">
            <PageLoader />
            <AutoSaver />
            {/* Sidebar */}
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            {/* Content area */}
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-transparent">
                {/* Subtle background pattern */}
                <div className="fixed inset-0 bg-dot-pattern pointer-events-none z-0"></div>

                {/* Site header */}
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} user={user} />

                <main className="grow relative">
                    <div className={fullWidth ? "w-full px-2 sm:px-3 py-2 mx-auto" : "p-4 sm:p-6 lg:p-8 w-full max-w-[100vw] mx-auto"}>
                        {header && (
                            <div className="sm:flex sm:justify-between sm:items-center mb-6">
                                <div className="mb-4 sm:mb-0">
                                    <h1 className="text-2xl md:text-3xl text-gray-900 dark:text-white font-bold tracking-tight drop-shadow-md">{header}</h1>
                                </div>
                            </div>
                        )}
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
