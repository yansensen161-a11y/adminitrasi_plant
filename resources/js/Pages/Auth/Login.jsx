import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import React, { useState } from 'react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });
    
    const [isEnteringDashboard, setIsEnteringDashboard] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        
        // Trigger animation
        setIsEnteringDashboard(true);
        
        // Wait for animation to cover screen before sending request
        setTimeout(() => {
            post(route('login'), {
                onFinish: () => {
                    reset('password');
                },
                onError: () => {
                    // Revert animation if login fails
                    setIsEnteringDashboard(false);
                }
            });
        }, 800);
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <div className="mb-8 text-center">
                <h2 className="text-2xl font-extrabold text-white mb-1.5 tracking-tight">Welcome Back</h2>
                <p className="text-gray-500 text-sm">Sign in to continue to your dashboard</p>
            </div>

            {status && (
                <div className="mb-5 text-sm font-medium text-emerald-400 bg-emerald-400/10 p-3.5 rounded-xl border border-emerald-400/20 flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 16 16"><path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0Zm3.22 5.72-4 4a.75.75 0 0 1-1.06 0l-2-2a.75.75 0 1 1 1.06-1.06L6.7 8.14l3.47-3.47a.75.75 0 1 1 1.06 1.06Z"/></svg>
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2" htmlFor="email">
                        Email Address
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <svg className="w-4.5 h-4.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                            </svg>
                        </div>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            autoComplete="username"
                            autoFocus
                            onChange={(e) => setData('email', e.target.value)}
                            className="w-full bg-white/[0.04] border border-white/10 focus:border-violet-500/60 focus:ring-0 rounded-xl text-white pl-11 pr-4 py-3 transition-all input-glow placeholder:text-gray-600"
                            placeholder="you@example.com"
                        />
                    </div>
                    {errors.email && <p className="mt-2 text-sm text-red-400 flex items-center gap-1"><svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 16 16"><path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0Zm0 11a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-4.5a1 1 0 0 1-2 0v-3a1 1 0 1 1 2 0v3Z"/></svg>{errors.email}</p>}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2" htmlFor="password">
                        Password
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <svg className="w-4.5 h-4.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                            </svg>
                        </div>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            className="w-full bg-white/[0.04] border border-white/10 focus:border-violet-500/60 focus:ring-0 rounded-xl text-white pl-11 pr-4 py-3 transition-all input-glow placeholder:text-gray-600"
                            placeholder="••••••••"
                        />
                    </div>
                    {errors.password && <p className="mt-2 text-sm text-red-400 flex items-center gap-1"><svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 16 16"><path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0Zm0 11a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-4.5a1 1 0 0 1-2 0v-3a1 1 0 1 1 2 0v3Z"/></svg>{errors.password}</p>}
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center group cursor-pointer">
                        <input
                            type="checkbox"
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="rounded-md border-white/15 bg-white/5 text-violet-500 focus:ring-violet-500/30 focus:ring-offset-0 w-4 h-4"
                        />
                        <span className="ms-2.5 text-sm text-gray-500 group-hover:text-gray-400 transition-colors">
                            Remember me
                        </span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm font-semibold text-violet-400 hover:text-violet-300 transition-colors"
                        >
                            Forgot password?
                        </Link>
                    )}
                </div>

                <div className="pt-3">
                    <button
                        type="submit"
                        disabled={processing}
                        className="btn-shimmer w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 hover:from-violet-500 hover:via-indigo-500 hover:to-violet-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-950 focus:ring-violet-500 transition-all disabled:opacity-50 shadow-lg shadow-violet-600/25 hover:shadow-violet-500/40 hover:scale-[1.01] active:scale-[0.99]"
                    >
                        {processing ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : 'Sign In'}
                    </button>
                </div>
                
                <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/5"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                        <span className="px-3 bg-transparent text-gray-600">or</span>
                    </div>
                </div>

                <p className="text-center text-sm text-gray-500">
                    Don't have an account?{' '}
                    <Link href={route('register')} className="font-bold text-violet-400 hover:text-violet-300 transition-colors">
                        Sign up now
                    </Link>
                </p>
            </form>

            {/* Transition Animation Overlay */}
            <div 
                className={`fixed inset-0 z-[100] bg-gradient-to-br from-violet-600 via-indigo-600 to-violet-800 flex items-center justify-center transition-all duration-[800ms] ease-[cubic-bezier(0.65,0,0.35,1)] pointer-events-none ${
                    isEnteringDashboard ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.01] rounded-full'
                }`}
                style={{ transformOrigin: 'center center' }}
            >
                <div className={`transition-all duration-500 delay-300 ${isEnteringDashboard ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                    <div className="flex flex-col items-center">
                        <div className="w-20 h-20 rounded-2xl bg-white shadow-2xl flex items-center justify-center mb-6 animate-pulse">
                            <svg className="w-10 h-10 text-violet-600 fill-current" viewBox="0 0 24 24">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-extrabold text-white tracking-tight">System Plant</h2>
                        <p className="text-violet-200 mt-2 font-medium">Entering Dashboard...</p>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
