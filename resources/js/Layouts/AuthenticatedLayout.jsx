import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import Sidebar from '@/Partials/Sidebar';
import Header from '@/Partials/Header';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950 text-gray-600 dark:text-gray-400 font-inter antialiased selection:bg-violet-500 selection:text-white">
            {/* Sidebar */}
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            {/* Content area */}
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                {/* Subtle background pattern */}
                <div className="fixed inset-0 bg-dot-pattern pointer-events-none z-0"></div>

                {/* Site header */}
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} user={user} />

                <main className="grow relative z-10">
                    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
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

                {/* Footer */}
                <footer className="relative z-10 mt-auto bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm py-6">
                    {/* Gradient top border */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/15 to-transparent"></div>
                    <div className="px-4 sm:px-6 lg:px-8 max-w-9xl mx-auto flex items-center justify-between text-sm text-gray-500 dark:text-gray-500">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center">
                                <svg className="w-3 h-3 text-violet-500/60 fill-current" viewBox="0 0 24 24">
                                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                </svg>
                            </div>
                            <span>&copy; {new Date().getFullYear()} System Plant. All rights reserved.</span>
                        </div>
                        <div className="flex space-x-4">
                            <a href="#" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Terms of Service</a>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
