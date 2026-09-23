import React, { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import { 
    User, 
    Lock, 
    Eye, 
    EyeOff, 
    ArrowRight, 
    ShieldCheck, 
    Loader2, 
    AlertCircle, 
    CheckCircle2, 
    Check,
    UserPlus,
    LogIn
} from 'lucide-react';

export default function LoginFormPanel({
    status = null,
    canResetPassword = false,
    phase = 'init',
    initialMode = 'login',
}) {
    const [mode, setMode] = useState(initialMode); // 'login' | 'register'
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Form state for Login
    const loginForm = useForm({
        email: '',
        password: '',
        remember: false,
    });

    // Form state for Register
    const registerForm = useForm({
        name: '',
        password: '',
        password_confirmation: '',
    });

    const handleLoginSubmit = (e) => {
        e.preventDefault();
        loginForm.post(route('login'), {
            onFinish: () => loginForm.reset('password'),
        });
    };

    const handleRegisterSubmit = (e) => {
        e.preventDefault();
        registerForm.post(route('register'), {
            onFinish: () => registerForm.reset('password', 'password_confirmation'),
        });
    };

    const isBusy = loginForm.processing || registerForm.processing;

    return (
        <div
            className={`pointer-events-auto w-full max-w-lg transition-all duration-1000 delay-500 ${
                phase === 'active' || phase === 'ready'
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 translate-x-12'
            }`}
        >
            {/* Cyberpunk Glassmorphic Card Container */}
            <div className="relative rounded-2xl border border-white/20 bg-black/60 p-7 sm:p-9 lg:p-10 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.8),0_0_20px_rgba(255,255,255,0.12)]">
                {/* Tech Corner Brackets */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white"></div>

                {/* Panel Header */}
                <div className="flex items-center justify-between border-b border-white/15 pb-4 mb-5">
                    <div>
                        <div className="text-xs font-mono uppercase tracking-[0.25em] text-slate-300 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse shadow-[0_0_8px_#ffffff]"></span>
                            {mode === 'login' ? 'AUTHENTICATION TERMINAL' : 'OPERATOR ENROLLMENT'}
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-white font-sans mt-1 tracking-tight">
                            {mode === 'login' ? 'Access Portal' : 'Register Operator'}
                        </h2>
                    </div>
                    <div className="text-xs font-mono text-gray-300 border border-gray-800 bg-black/50 px-2.5 py-1 rounded">
                        {mode === 'login' ? 'SEC_ID: 809-X' : 'ENROLL_ID: NEW'}
                    </div>
                </div>

                {/* Mode Selector Tabs (Masuk vs Daftar) */}
                <div className="flex items-center gap-2 p-1.5 mb-6 bg-black/40 rounded-xl border border-white/15">
                    <button
                        type="button"
                        onClick={() => setMode('login')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-mono tracking-wider uppercase font-bold transition-all ${
                            mode === 'login'
                                ? 'bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.5)]'
                                : 'text-gray-400 hover:text-gray-200'
                        }`}
                    >
                        <LogIn className="w-4 h-4" />
                        <span>Masuk</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('register')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-mono tracking-wider uppercase font-bold transition-all ${
                            mode === 'register'
                                ? 'bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.5)]'
                                : 'text-gray-400 hover:text-gray-200'
                        }`}
                    >
                        <UserPlus className="w-4 h-4" />
                        <span>Daftar Akun</span>
                    </button>
                </div>

                {/* Status Banners */}
                {status && (
                    <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 text-sm text-emerald-300">
                        <CheckCircle2 className="w-4.5 h-4.5 shrink-0 text-emerald-400" />
                        <span>{status}</span>
                    </div>
                )}

                {/* ─── LOGIN FORM ─── */}
                {mode === 'login' && (
                    <form onSubmit={handleLoginSubmit} className="space-y-5">
                        {/* Username / Email Field */}
                        <div>
                            <label
                                htmlFor="login-email"
                                className="block text-sm font-mono tracking-wider text-gray-200 uppercase mb-2 font-medium"
                            >
                                Nama Pengguna / Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <User className="w-5 h-5" />
                                </div>
                                <input
                                    id="login-email"
                                    name="email"
                                    type="text"
                                    placeholder="Masukkan nama pengguna atau email"
                                    autoComplete="username"
                                    autoFocus
                                    value={loginForm.data.email}
                                    onChange={(e) => loginForm.setData('email', e.target.value)}
                                    disabled={isBusy}
                                    required
                                    className="w-full pl-11 pr-4 py-3.5 bg-black/50 border border-white/20 focus:border-white focus:ring-1 focus:ring-white rounded-xl text-base text-white placeholder:text-sm placeholder-gray-400 transition-all outline-none"
                                />
                            </div>
                            {loginForm.errors.email && (
                                <p className="mt-1.5 text-xs sm:text-sm text-red-400 flex items-center gap-1.5 font-mono">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{loginForm.errors.email}</span>
                                </p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label
                                    htmlFor="login-password"
                                    className="block text-sm font-mono tracking-wider text-gray-200 uppercase font-medium"
                                >
                                    Kata Sandi
                                </label>
                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="text-xs sm:text-sm font-mono text-slate-300 hover:text-white transition-colors"
                                    >
                                        Lupa kata sandi?
                                    </Link>
                                )}
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    id="login-password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Masukkan kata sandi"
                                    autoComplete="current-password"
                                    value={loginForm.data.password}
                                    onChange={(e) => loginForm.setData('password', e.target.value)}
                                    disabled={isBusy}
                                    required
                                    className="w-full pl-11 pr-11 py-3.5 bg-black/50 border border-white/20 focus:border-white focus:ring-1 focus:ring-white rounded-xl text-base text-white placeholder:text-sm placeholder-gray-400 transition-all outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-200 transition-colors"
                                    aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            {loginForm.errors.password && (
                                <p className="mt-1.5 text-xs sm:text-sm text-red-400 flex items-center gap-1.5 font-mono">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{loginForm.errors.password}</span>
                                </p>
                            )}
                        </div>

                        {/* Remember Me Checkbox */}
                        <div className="flex items-center pt-1">
                            <label
                                htmlFor="remember-checkbox"
                                className="flex items-center gap-3 cursor-pointer text-sm font-mono text-gray-300 hover:text-white select-none group"
                            >
                                <div className="relative flex items-center justify-center">
                                    <input
                                        id="remember-checkbox"
                                        type="checkbox"
                                        name="remember"
                                        checked={loginForm.data.remember}
                                        onChange={(e) => loginForm.setData('remember', e.target.checked)}
                                        disabled={isBusy}
                                        className="sr-only peer"
                                    />
                                    <div
                                        className={`w-5 h-5 rounded-md border transition-all duration-150 flex items-center justify-center peer-focus-visible:ring-2 peer-focus-visible:ring-white ${
                                            loginForm.data.remember
                                                ? 'bg-white border-white shadow-[0_0_10px_rgba(255,255,255,0.7)]'
                                                : 'bg-black/80 border-white/30 group-hover:border-white/70'
                                        }`}
                                    >
                                        {loginForm.data.remember && (
                                            <Check className="w-3.5 h-3.5 text-black stroke-[3]" />
                                        )}
                                    </div>
                                </div>
                                <span className="transition-colors">Ingat saya di perangkat ini</span>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isBusy}
                            className="group relative w-full mt-3 flex items-center justify-center gap-2.5 py-3.5 sm:py-4 px-6 rounded-xl bg-gradient-to-r from-white via-slate-100 to-slate-200 hover:from-slate-100 hover:to-white text-black text-sm font-mono uppercase font-bold tracking-widest transition-all duration-200 shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:shadow-[0_0_30px_rgba(255,255,255,0.7)] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loginForm.processing ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin text-black" />
                                    <span>MEMVERIFIKASI AKSES...</span>
                                </>
                            ) : (
                                <>
                                    <span>MASUK KE SISTEM</span>
                                    <ArrowRight className="w-5 h-5 stroke-[2.5] text-black group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>

                        {/* Switch to Register */}
                        <div className="text-center pt-2 text-sm font-mono text-gray-400">
                            Belum punya akun?{' '}
                            <button
                                type="button"
                                onClick={() => setMode('register')}
                                className="text-white hover:text-slate-300 font-semibold transition-colors underline-offset-4 hover:underline"
                            >
                                Daftar sekarang ↗
                            </button>
                        </div>
                    </form>
                )}

                {/* ─── REGISTER FORM ─── */}
                {mode === 'register' && (
                    <form onSubmit={handleRegisterSubmit} className="space-y-5">
                        {/* Username Field */}
                        <div>
                            <label
                                htmlFor="register-name"
                                className="block text-sm font-mono tracking-wider text-gray-200 uppercase mb-2 font-medium"
                            >
                                Nama Pengguna (Username)
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <User className="w-5 h-5" />
                                </div>
                                <input
                                    id="register-name"
                                    name="name"
                                    type="text"
                                    placeholder="Contoh: yansen atau operator1"
                                    autoComplete="username"
                                    autoFocus
                                    value={registerForm.data.name}
                                    onChange={(e) => registerForm.setData('name', e.target.value)}
                                    disabled={isBusy}
                                    required
                                    className="w-full pl-11 pr-4 py-3.5 bg-black/50 border border-white/20 focus:border-white focus:ring-1 focus:ring-white rounded-xl text-base text-white placeholder:text-sm placeholder-gray-400 transition-all outline-none"
                                />
                            </div>
                            {registerForm.errors.name && (
                                <p className="mt-1.5 text-xs sm:text-sm text-red-400 flex items-center gap-1.5 font-mono">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{registerForm.errors.name}</span>
                                </p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label
                                htmlFor="register-password"
                                className="block text-sm font-mono tracking-wider text-gray-200 uppercase mb-2 font-medium"
                            >
                                Kata Sandi (Password)
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    id="register-password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Minimal 8 karakter"
                                    autoComplete="new-password"
                                    value={registerForm.data.password}
                                    onChange={(e) => registerForm.setData('password', e.target.value)}
                                    disabled={isBusy}
                                    required
                                    className="w-full pl-11 pr-11 py-3.5 bg-black/50 border border-white/20 focus:border-white focus:ring-1 focus:ring-white rounded-xl text-base text-white placeholder:text-sm placeholder-gray-400 transition-all outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-200 transition-colors"
                                    aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            {registerForm.errors.password && (
                                <p className="mt-1.5 text-xs sm:text-sm text-red-400 flex items-center gap-1.5 font-mono">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{registerForm.errors.password}</span>
                                </p>
                            )}
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label
                                htmlFor="register-password-confirmation"
                                className="block text-sm font-mono tracking-wider text-gray-200 uppercase mb-2 font-medium"
                            >
                                Konfirmasi Kata Sandi
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <input
                                    id="register-password-confirmation"
                                    name="password_confirmation"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="Ulangi kata sandi"
                                    autoComplete="new-password"
                                    value={registerForm.data.password_confirmation}
                                    onChange={(e) => registerForm.setData('password_confirmation', e.target.value)}
                                    disabled={isBusy}
                                    required
                                    className="w-full pl-11 pr-11 py-3.5 bg-black/50 border border-white/20 focus:border-white focus:ring-1 focus:ring-white rounded-xl text-base text-white placeholder:text-sm placeholder-gray-400 transition-all outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-200 transition-colors"
                                    aria-label={showConfirmPassword ? "Sembunyikan konfirmasi kata sandi" : "Tampilkan konfirmasi kata sandi"}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            {registerForm.errors.password_confirmation && (
                                <p className="mt-1.5 text-xs sm:text-sm text-red-400 flex items-center gap-1.5 font-mono">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{registerForm.errors.password_confirmation}</span>
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isBusy}
                            className="group relative w-full mt-3 flex items-center justify-center gap-2.5 py-3.5 sm:py-4 px-6 rounded-xl bg-gradient-to-r from-white via-slate-100 to-slate-200 hover:from-slate-100 hover:to-white text-black text-sm font-mono uppercase font-bold tracking-widest transition-all duration-200 shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:shadow-[0_0_30px_rgba(255,255,255,0.7)] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {registerForm.processing ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin text-black" />
                                    <span>MENDAFTARKAN AKUN...</span>
                                </>
                            ) : (
                                <>
                                    <span>INITIALIZE REGISTRATION</span>
                                    <ArrowRight className="w-5 h-5 stroke-[2.5] text-black group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>

                        {/* Switch to Login */}
                        <div className="text-center pt-2 text-sm font-mono text-gray-400">
                            Sudah punya akun?{' '}
                            <button
                                type="button"
                                onClick={() => setMode('login')}
                                className="text-white hover:text-slate-300 font-semibold transition-colors underline-offset-4 hover:underline"
                            >
                                Masuk ke Sistem (Sign In) →
                            </button>
                        </div>
                    </form>
                )}

                {/* Security Badge */}
                <div className="mt-6 pt-4 border-t border-gray-900 flex items-center justify-center gap-2 text-xs font-mono text-gray-400">
                    <ShieldCheck className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
                    <span>Akses khusus pengguna berwenang</span>
                </div>
            </div>
        </div>
    );
}
