import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function Index({ permissions }) {
    const { delete: destroy } = useForm();

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this permission?')) {
            destroy(route('permissions.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout header="Permission Management">
            <Head title="Permissions" />

            <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-xl mb-8">
                <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">All Permissions</h2>
                    <Link
                        href={route('permissions.create')}
                        className="bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200"
                    >
                        Create Permission
                    </Link>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700/50 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-4 font-semibold">Name</th>
                                <th scope="col" className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {permissions.map((permission, index) => (
                                <motion.tr 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    key={permission.id} 
                                    className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                >
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                        <span className="bg-emerald-100 text-emerald-800 font-semibold px-3 py-1 rounded-full dark:bg-emerald-900/30 dark:text-emerald-300">
                                            {permission.name}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={route('permissions.edit', permission.id)}
                                            className="font-medium text-violet-600 dark:text-violet-500 hover:underline mr-4"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(permission.id)}
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
