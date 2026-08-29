import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function Index({ roles }) {
    const { delete: destroy } = useForm();

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this role?')) {
            destroy(route('roles.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout header="Role Management">
            <Head title="Roles" />

            <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-xl mb-8">
                <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">All Roles</h2>
                    <Link
                        href={route('roles.create')}
                        className="bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200"
                    >
                        Create Role
                    </Link>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700/50 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-4 font-semibold">Name</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Permissions</th>
                                <th scope="col" className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {roles.map((role, index) => (
                                <motion.tr 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    key={role.id} 
                                    className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                >
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                        {role.name}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2 flex-wrap">
                                            {role.permissions && role.permissions.map(permission => (
                                                <span key={permission.id} className="bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-emerald-900/30 dark:text-emerald-300">
                                                    {permission.name}
                                                </span>
                                            ))}
                                            {(!role.permissions || role.permissions.length === 0) && (
                                                <span className="text-gray-400 italic text-xs">No permissions</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={route('roles.edit', role.id)}
                                            className="font-medium text-violet-600 dark:text-violet-500 hover:underline mr-4"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(role.id)}
                                            className="font-medium text-red-600 dark:text-red-500 hover:underline"
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
