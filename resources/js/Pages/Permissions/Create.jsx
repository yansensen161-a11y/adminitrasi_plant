import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('permissions.store'));
    };

    return (
        <AuthenticatedLayout header="Create Permission">
            <Head title="Create Permission" />

            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="max-w-2xl bg-white dark:bg-gray-800 shadow-sm sm:rounded-xl p-6"
            >
                <form onSubmit={submit}>
                    <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Permission Name</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            placeholder="e.g. edit articles"
                            className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500"
                        />
                        {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
                    </div>

                    <div className="flex items-center justify-end gap-4">
                        <Link href={route('permissions.index')} className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-200 disabled:opacity-75"
                        >
                            Save Permission
                        </button>
                    </div>
                </form>
            </motion.div>
        </AuthenticatedLayout>
    );
}
