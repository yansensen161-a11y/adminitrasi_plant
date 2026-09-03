import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function Edit({ role, permissions }) {
    const { data, setData, put, processing, errors } = useForm({
        name: role.name,
        permissions: role.permissions.map(p => p.name),
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('roles.update', role.id));
    };

    const handlePermissionChange = (permName) => {
        let selected = [...data.permissions];
        if (selected.includes(permName)) {
            selected = selected.filter(p => p !== permName);
        } else {
            selected.push(permName);
        }
        setData('permissions', selected);
    };

    return (
        <AuthenticatedLayout header="Edit Role">
            <Head title="Edit Role" />

            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="max-w-2xl bg-white dark:bg-gray-800 shadow-sm sm:rounded-xl p-6"
            >
                <form onSubmit={submit}>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role Name</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        />
                        {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
                    </div>

                    <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Assign Permissions</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {permissions.map(permission => (
                                <label key={permission.id} className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition">
                                    <input
                                        type="checkbox"
                                        checked={data.permissions.includes(permission.name)}
                                        onChange={() => handlePermissionChange(permission.name)}
                                        className="rounded border-gray-300 text-emerald-600 shadow-sm focus:ring-emerald-500 bg-white dark:bg-gray-900"
                                    />
                                    <span className="text-gray-700 dark:text-gray-300 font-medium">{permission.name}</span>
                                </label>
                            ))}
                            {permissions.length === 0 && (
                                <div className="text-sm text-gray-500">No permissions available.</div>
                            )}
                        </div>
                        {errors.permissions && <div className="text-red-500 text-sm mt-1">{errors.permissions}</div>}
                    </div>

                    <div className="flex items-center justify-end gap-4">
                        <Link href={route('roles.index')} className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-200 disabled:opacity-75"
                        >
                            Update Role
                        </button>
                    </div>
                </form>
            </motion.div>
        </AuthenticatedLayout>
    );
}
