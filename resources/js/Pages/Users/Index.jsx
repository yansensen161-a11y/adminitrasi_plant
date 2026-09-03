import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function Index({ users }) {
    const { flash } = usePage().props;
    const { delete: destroy } = useForm();

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this user?')) {
            destroy(route('users.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout header="User Management">
            <Head title="Users" />

            {/* Flash notification */}
            {flash?.message && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium flex items-center gap-3">
                    <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                    </svg>
                    <span>{flash.message}</span>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-xl mb-8 border border-gray-100 dark:border-gray-700/60">
                <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">All Registered Users</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Manage user credentials, roles, and export data.</p>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <a
                            href={route('reports.users.pdf')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm text-sm transition duration-200"
                        >
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                <path d="M4 18h12a2 2 0 002-2V6l-4-4H4a2 2 0 00-2 2v12a2 2 0 002 2zm8-14l3 3h-3V4zM6 10h8v2H6v-2zm0 3h8v2H6v-2z" />
                            </svg>
                            Export PDF
                        </a>
                        <Link
                            href={route('users.create')}
                            className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm text-sm transition duration-200"
                        >
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
                            </svg>
                            Create User
                        </Link>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700/50 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-4 font-semibold">Name</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Email</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Roles</th>
                                <th scope="col" className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {users.map((user, index) => (
                                <motion.tr 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    key={user.id} 
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                                >
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-semibold">{user.name}</div>
                                                <div className="text-[11px] font-mono text-gray-400">{user.id.substring(0, 8)}...</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2 flex-wrap">
                                            {user.roles && user.roles.map(role => (
                                                <span key={role.id} className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${role.name === 'super-admin' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' : 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300'}`}>
                                                    {role.name}
                                                </span>
                                            ))}
                                            {(!user.roles || user.roles.length === 0) && (
                                                <span className="text-gray-400 italic text-xs">No roles</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={route('users.edit', user.id)}
                                            className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline mr-4"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="font-semibold text-red-600 dark:text-red-400 hover:underline"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
