import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Index({ logs, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [eventFilter, setEventFilter] = useState(filters.event || '');
    const [selectedLog, setSelectedLog] = useState(null);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('activity-logs.index'), {
            search: search,
            event: eventFilter,
        }, { preserveState: true });
    };

    const handleEventChange = (e) => {
        const value = e.target.value;
        setEventFilter(value);
        router.get(route('activity-logs.index'), {
            search: search,
            event: value,
        }, { preserveState: true });
    };

    const getEventBadge = (event) => {
        switch (event) {
            case 'created':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-500"></span>
                        Created
                    </span>
                );
            case 'updated':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-amber-500"></span>
                        Updated
                    </span>
                );
            case 'deleted':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">
                        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-red-500"></span>
                        Deleted
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-blue-500"></span>
                        {event || 'Activity'}
                    </span>
                );
        }
    };

    return (
        <AuthenticatedLayout header="Activity Logs & Audit Trail">
            <Head title="Activity Logs" />

            {/* Header & Filter Card */}
            <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-xl mb-6 p-4 sm:p-6 border border-gray-100 dark:border-gray-700/60">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex-1 w-full flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search logs by description, event, or name..."
                                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-violet-500 text-gray-800 dark:text-gray-100"
                            />
                            <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 fill-current" viewBox="0 0 16 16">
                                <path d="M7 14c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7ZM7 2C4.243 2 2 4.243 2 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5Z" />
                                <path d="m13.314 11.9 2.393 2.393a.999.999 0 1 1-1.414 1.414L11.9 13.314a8.019 8.019 0 0 0 1.414-1.414Z" />
                            </svg>
                        </div>

                        <select
                            value={eventFilter}
                            onChange={handleEventChange}
                            className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-100 text-sm rounded-lg px-4 py-2 focus:outline-none focus:border-violet-500"
                        >
                            <option value="">All Events</option>
                            <option value="created">Created</option>
                            <option value="updated">Updated</option>
                            <option value="deleted">Deleted</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700 text-white font-medium px-5 py-2 rounded-lg text-sm transition shadow-sm"
                    >
                        Filter
                    </button>
                </form>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700/60">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700/50 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-4 font-semibold">Event</th>
                                <th scope="col" className="px-6 py-4 font-semibold">User (Causer)</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Description</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Subject</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Timestamp</th>
                                <th scope="col" className="px-6 py-4 font-semibold text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {logs.data && logs.data.length > 0 ? (
                                logs.data.map((log, index) => (
                                    <motion.tr
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2, delay: index * 0.03 }}
                                        key={log.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            {getEventBadge(log.event)}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-300 flex items-center justify-center font-bold text-xs">
                                                    {log.causer?.name ? log.causer.name.charAt(0).toUpperCase() : 'S'}
                                                </div>
                                                <div>
                                                    <div className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                                                        {log.causer?.name || 'System / Guest'}
                                                    </div>
                                                    <div className="text-[11px] text-gray-400">
                                                        {log.causer?.email || '-'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-800 dark:text-gray-200 font-medium">
                                            {log.description}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">
                                                {log.subject_type ? log.subject_type.split('\\').pop() : 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
                                            {new Date(log.created_at).toLocaleString('id-ID', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setSelectedLog(log)}
                                                className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline bg-violet-50 dark:bg-violet-900/30 px-2.5 py-1.5 rounded-lg transition"
                                            >
                                                View Diff
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-400 dark:text-gray-500">
                                        <svg className="w-12 h-12 mx-auto mb-3 opacity-40 fill-current" viewBox="0 0 24 24">
                                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                                        </svg>
                                        No activity logs recorded yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {logs.links && logs.links.length > 3 && (
                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center text-xs text-gray-500">
                        <div>
                            Showing {logs.from || 0} to {logs.to || 0} of {logs.total} logs
                        </div>
                        <div className="flex gap-1">
                            {logs.links.map((link, idx) => (
                                <button
                                    key={idx}
                                    disabled={!link.url || link.active}
                                    onClick={() => link.url && router.visit(link.url)}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-3 py-1 rounded ${
                                        link.active
                                            ? 'bg-violet-600 text-white font-bold'
                                            : link.url
                                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                                            : 'text-gray-400 cursor-not-allowed'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal for Properties Diff */}
            <AnimatePresence>
                {selectedLog && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[85vh] flex flex-col"
                        >
                            <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-700">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                        Log Details & Changes
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Log ID: <span className="font-mono">{selectedLog.id}</span>
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedLog(null)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl font-bold p-1"
                                >
                                    &times;
                                </button>
                            </div>

                            <div className="mt-4 space-y-4 overflow-y-auto pr-1">
                                <div className="grid grid-cols-2 gap-4 text-xs">
                                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                        <span className="text-gray-400 block font-semibold mb-1">Causer</span>
                                        <span className="font-medium text-gray-800 dark:text-gray-200">
                                            {selectedLog.causer?.name || 'System'} ({selectedLog.causer?.email || 'N/A'})
                                        </span>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                        <span className="text-gray-400 block font-semibold mb-1">Event</span>
                                        {getEventBadge(selectedLog.event)}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-xs font-bold uppercase text-gray-400 mb-2">Properties & Data Changes</h4>
                                    <pre className="bg-gray-900 text-emerald-400 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-72">
                                        {JSON.stringify(selectedLog.properties, null, 2) || '{}'}
                                    </pre>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                                <button
                                    onClick={() => setSelectedLog(null)}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold text-xs rounded-lg transition"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AuthenticatedLayout>
    );
}
