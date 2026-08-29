import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function Create({ roles }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        roles: [],
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('users.store'));
    };

    const handleRoleChange = (roleName) => {
        let selectedRoles = [...data.roles];
        if (selectedRoles.includes(roleName)) {
            selectedRoles = selectedRoles.filter(r => r !== roleName);
        } else {
            selectedRoles.push(roleName);
        }
        setData('roles', selectedRoles);
    };

    return (
        <AuthenticatedLayout header="Create User">
            <Head title="Create User" />

            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="max-w-2xl bg-white dark:bg-gray-800 shadow-sm sm:rounded-xl p-6"
            >
                <form onSubmit={submit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500"
                        />
                        {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={e => setData('email', e.target.value)}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500"
                        />
                        {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
                        <input
                            type="password"
                            value={data.password}
                            onChange={e => setData('password', e.target.value)}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500"
                        />
                        {errors.password && <div className="text-red-500 text-sm mt-1">{errors.password}</div>}
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm Password</label>
                        <input
                            type="password"
                            value={data.password_confirmation}
                            onChange={e => setData('password_confirmation', e.target.value)}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500"
                        />
                    </div>

                    <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Assign Roles</label>
                        <div className="grid grid-cols-2 gap-4">
                            {roles.map(role => (
                                <label key={role.id} className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition">
                                    <input
                                        type="checkbox"
                                        checked={data.roles.includes(role.name)}
                                        onChange={() => handleRoleChange(role.name)}
                                        className="rounded border-gray-300 text-violet-600 shadow-sm focus:ring-violet-500 bg-white dark:bg-gray-900"
                                    />
                                    <span className="text-gray-700 dark:text-gray-300 font-medium">{role.name}</span>
                                </label>
                            ))}
                            {roles.length === 0 && (
                                <div className="text-sm text-gray-500">No roles available.</div>
                            )}
                        </div>
                        {errors.roles && <div className="text-red-500 text-sm mt-1">{errors.roles}</div>}
                    </div>

                    <div className="flex items-center justify-end gap-4">
                        <Link href={route('users.index')} className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-200 disabled:opacity-75"
                        >
                            Save User
                        </button>
                    </div>
                </form>
            </motion.div>
        </AuthenticatedLayout>
    );
}
