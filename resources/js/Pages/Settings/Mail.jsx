import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function Mail({ settings }) {
    const { flash, errors: pageErrors } = usePage().props;

    const { data, setData, post, processing, recentlySuccessful, errors } = useForm({
        mail_mailer: settings.mail_mailer || 'smtp',
        mail_host: settings.mail_host || '127.0.0.1',
        mail_port: settings.mail_port || '2525',
        mail_username: settings.mail_username || '',
        mail_password: settings.mail_password || '',
        mail_encryption: settings.mail_encryption || 'tls',
        mail_from_address: settings.mail_from_address || '',
        mail_from_name: settings.mail_from_name || '',
    });

    const {
        data: testData,
        setData: setTestData,
        post: postTest,
        processing: testProcessing,
        errors: testErrors,
        reset: resetTest,
    } = useForm({
        test_email: '',
    });

    const handleSave = (e) => {
        e.preventDefault();
        post(route('settings.mail.update'));
    };

    const handleSendTest = (e) => {
        e.preventDefault();
        postTest(route('settings.mail.test'), {
            onSuccess: () => resetTest(),
        });
    };

    return (
        <AuthenticatedLayout header="Email & SMTP Settings">
            <Head title="Email Settings" />

            <div className="max-w-4xl space-y-8">
                {/* Flash Message */}
                {flash?.message && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium flex items-center gap-3"
                    >
                        <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 20 20">
                            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                        </svg>
                        <span>{flash.message}</span>
                    </motion.div>
                )}

                {/* Main Settings Form */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/60 overflow-hidden"
                >
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700/60">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
                                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                                    Dynamic SMTP Configuration
                                </h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Configure outbound mail server settings stored dynamically in the database.
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSave} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Mailer */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-2">
                                    Mail Driver
                                </label>
                                <select
                                    value={data.mail_mailer}
                                    onChange={(e) => setData('mail_mailer', e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-violet-500 focus:outline-none"
                                >
                                    <option value="smtp">SMTP</option>
                                    <option value="sendmail">Sendmail</option>
                                    <option value="log">Log (Testing)</option>
                                </select>
                                {errors.mail_mailer && (
                                    <p className="text-xs text-red-500 mt-1">{errors.mail_mailer}</p>
                                )}
                            </div>

                            {/* Host */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-2">
                                    SMTP Host
                                </label>
                                <input
                                    type="text"
                                    value={data.mail_host}
                                    onChange={(e) => setData('mail_host', e.target.value)}
                                    placeholder="smtp.mailgun.org or smtp.gmail.com"
                                    className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-violet-500 focus:outline-none"
                                />
                                {errors.mail_host && (
                                    <p className="text-xs text-red-500 mt-1">{errors.mail_host}</p>
                                )}
                            </div>

                            {/* Port */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-2">
                                    SMTP Port
                                </label>
                                <input
                                    type="number"
                                    value={data.mail_port}
                                    onChange={(e) => setData('mail_port', e.target.value)}
                                    placeholder="587 or 465"
                                    className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-violet-500 focus:outline-none"
                                />
                                {errors.mail_port && (
                                    <p className="text-xs text-red-500 mt-1">{errors.mail_port}</p>
                                )}
                            </div>

                            {/* Encryption */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-2">
                                    Encryption
                                </label>
                                <select
                                    value={data.mail_encryption}
                                    onChange={(e) => setData('mail_encryption', e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-violet-500 focus:outline-none"
                                >
                                    <option value="tls">TLS</option>
                                    <option value="ssl">SSL</option>
                                    <option value="null">None</option>
                                </select>
                                {errors.mail_encryption && (
                                    <p className="text-xs text-red-500 mt-1">{errors.mail_encryption}</p>
                                )}
                            </div>

                            {/* Username */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-2">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    value={data.mail_username}
                                    onChange={(e) => setData('mail_username', e.target.value)}
                                    placeholder="user@example.com"
                                    className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-violet-500 focus:outline-none"
                                />
                                {errors.mail_username && (
                                    <p className="text-xs text-red-500 mt-1">{errors.mail_username}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={data.mail_password}
                                    onChange={(e) => setData('mail_password', e.target.value)}
                                    placeholder="••••••••••••"
                                    className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-violet-500 focus:outline-none"
                                />
                                {errors.mail_password && (
                                    <p className="text-xs text-red-500 mt-1">{errors.mail_password}</p>
                                )}
                            </div>

                            {/* From Address */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-2">
                                    Sender Email Address (From)
                                </label>
                                <input
                                    type="email"
                                    value={data.mail_from_address}
                                    onChange={(e) => setData('mail_from_address', e.target.value)}
                                    placeholder="notifications@systemplant.com"
                                    className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-violet-500 focus:outline-none"
                                />
                                {errors.mail_from_address && (
                                    <p className="text-xs text-red-500 mt-1">{errors.mail_from_address}</p>
                                )}
                            </div>

                            {/* From Name */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-2">
                                    Sender Name
                                </label>
                                <input
                                    type="text"
                                    value={data.mail_from_name}
                                    onChange={(e) => setData('mail_from_name', e.target.value)}
                                    placeholder="System Plant Support"
                                    className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-violet-500 focus:outline-none"
                                />
                                {errors.mail_from_name && (
                                    <p className="text-xs text-red-500 mt-1">{errors.mail_from_name}</p>
                                )}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
                            <span className="text-xs text-gray-400">
                                Changes are saved directly to database and cached for performance.
                            </span>
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition shadow-md shadow-violet-600/20"
                            >
                                {processing ? 'Saving...' : 'Save Configuration'}
                            </button>
                        </div>
                    </form>
                </motion.div>

                {/* Test Email Section */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/60 p-6"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-gray-800 dark:text-white">
                                Test Email Connectivity
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Send a live test email to verify that your SMTP credentials and connection work properly.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSendTest} className="flex flex-col sm:flex-row gap-3 items-start">
                        <div className="flex-1 w-full">
                            <input
                                type="email"
                                value={testData.test_email}
                                onChange={(e) => setTestData('test_email', e.target.value)}
                                placeholder="Enter destination email (e.g. test@domain.com)"
                                className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                required
                            />
                            {testErrors.test_email && (
                                <p className="text-xs text-red-500 mt-1">{testErrors.test_email}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={testProcessing}
                            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition shadow-md shadow-emerald-600/20 shrink-0"
                        >
                            {testProcessing ? 'Sending Test Email...' : 'Send Test Email'}
                        </button>
                    </form>
                </motion.div>
            </div>
        </AuthenticatedLayout>
    );
}
