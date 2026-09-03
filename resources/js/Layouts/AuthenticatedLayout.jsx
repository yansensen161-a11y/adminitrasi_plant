import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import Sidebar from '@/Partials/Sidebar';
import Header from '@/Partials/Header';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-950 text-gray-600 dark:text-gray-400 font-inter antialiased selection:bg-[#0b5c3e] selection:text-white">
            {/* Sidebar */}
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            {/* Content area */}
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                {/* Subtle background pattern */}
                <div className="fixed inset-0 bg-dot-pattern pointer-events-none z-0"></div>

                {/* Site header */}
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} user={user} />

                <main className="grow relative z-10">
                    <div className="p-3 sm:p-4 w-full max-w-[100vw] mx-auto">
                        {header && (
                            <div className="sm:flex sm:justify-between sm:items-center mb-8">
                                <div className="mb-4 sm:mb-0">
                                    <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-extrabold tracking-tight">{header}</h1>
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
