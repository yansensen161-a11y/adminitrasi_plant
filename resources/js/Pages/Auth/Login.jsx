import { Head, Link, useForm, router } from '@inertiajs/react';
import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });
    
    const [isEnteringDashboard, setIsEnteringDashboard] = useState(false);
    const [isSwitchingPage, setIsSwitchingPage] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSwitchPage = (e) => {
        e.preventDefault();
        setIsSwitchingPage(true);
        setTimeout(() => {
            router.visit(route('register'));
        }, 800);
    };

    const submit = (e) => {
        e.preventDefault();
        
        setIsEnteringDashboard(true);
        
        setTimeout(() => {
            post(route('login'), {
                onFinish: () => {
                    reset('password');
                },
                onError: () => {
                    setIsEnteringDashboard(false);
                }
            });
        }, 1200);
    };

    const containerVariants = {
        hidden: { opacity: 0, x: -50 },
        visible: {
            opacity: 1, 
            x: 0,
            transition: { duration: 0.6, staggerChildren: 0.1, delayChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <div className="min-h-screen w-full flex items-center bg-[#030308] font-sans overflow-hidden relative selection:bg-fuchsia-500/30">
            <Head title="Log in" />

            {/* Background Image (Replace with your own image path later) */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {/* Fallback gradient if image not found */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a1a] via-[#050510] to-[#120a1f]"></div>
                
                {/* Image Placeholder */}
                <img 
                    src="/images/bg-login.jpg" 
                    alt="Background" 
                    className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-screen"
                    onError={(e) => {
                        e.target.style.display = 'none';
                    }}
                />
                
                {/* Gradient overlay to make form readable on the left */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#030308] via-[#030308]/90 to-transparent lg:w-3/4"></div>
            </div>

            {/* Glowing Effects */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] bg-blue-600/20 blur-[150px] rounded-full animate-pulse" style={{ animationDuration: '4s' }}></div>
                <div className="absolute bottom-[10%] left-[10%] w-[600px] h-[600px] bg-fuchsia-600/10 blur-[150px] rounded-full animate-pulse" style={{ animationDuration: '6s' }}></div>
            </div>

            {/* Main Content - Form on the left */}
            <div className="w-full lg:w-1/2 px-6 py-12 flex flex-col justify-center items-center lg:items-start lg:pl-[15%] relative z-10">
                
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="w-full max-w-[420px] bg-[#090b14]/70 backdrop-blur-xl border border-white/5 rounded-[24px] p-8 sm:p-10 shadow-[0_0_40px_rgba(0,0,0,0.5)] relative overflow-hidden"
                >
                    {/* Top glowing line */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>

                    <motion.div variants={itemVariants} className="text-center mb-10">
                        <h2 className="text-[28px] font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-fuchsia-400">Welcome Back</h2>
                        <p className="text-gray-400 text-sm mt-2 font-medium">Sign in to continue to your account</p>
                    </motion.div>

                    {status && (
                        <motion.div variants={itemVariants} className="mb-6 text-sm font-medium text-green-400 p-3 bg-green-400/10 rounded-lg border border-green-400/20 text-center">
                            {status}
                        </motion.div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        
                        {/* Email Input */}
                        <motion.div variants={itemVariants} className="space-y-1.5">
                            <div className="flex items-center gap-2 mb-2">
                                <svg className="w-4 h-4 text-fuchsia-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                                <label className="block text-sm font-medium text-gray-300">Email Address</label>
                            </div>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                autoComplete="username"
                                autoFocus
                                required
                                onChange={(e) => setData('email', e.target.value)}
                                className="w-full px-4 py-3 bg-[#111322]/80 border border-white/5 rounded-xl text-white outline-none transition-all duration-300 focus:bg-[#15182e] focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 placeholder-gray-600 shadow-inner"
                                placeholder="Enter your email"
                            />
                            {errors.email && <p className="text-xs text-red-400 font-medium mt-1">{errors.email}</p>}
                        </motion.div>

                        {/* Password Input */}
                        <motion.div variants={itemVariants} className="space-y-1.5 relative">
                            <div className="flex items-center gap-2 mb-2">
                                <svg className="w-4 h-4 text-fuchsia-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                                <label className="block text-sm font-medium text-gray-300">Password</label>
                            </div>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={data.password}
                                    autoComplete="current-password"
                                    required
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="w-full px-4 py-3 bg-[#111322]/80 border border-white/5 rounded-xl text-white outline-none transition-all duration-300 focus:bg-[#15182e] focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/50 placeholder-gray-600 shadow-inner pr-10"
                                    placeholder="Enter your password"
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                    )}
                                </button>
                            </div>
                            {errors.password && <p className="text-xs text-red-400 font-medium mt-1">{errors.password}</p>}
                        </motion.div>

                        {/* Options */}
                        <motion.div variants={itemVariants} className="flex items-center justify-between pt-1">
                            <label className="flex items-center cursor-pointer group">
                                <div className="relative flex items-center justify-center w-4 h-4 mr-2">
                                    <input 
                                        type="checkbox" 
                                        className="peer appearance-none w-4 h-4 border border-gray-600 rounded bg-transparent checked:bg-blue-500 checked:border-blue-500 transition-all cursor-pointer focus:ring-0 focus:ring-offset-0" 
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                    />
                                    <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">Remember me</span>
                            </label>
                            {canResetPassword && (
                                <Link href={route('password.request')} className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                                    Forgot password?
                                </Link>
                            )}
                        </motion.div>

                        {/* Submit Button */}
                        <motion.div variants={itemVariants} className="pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-fuchsia-600 text-white font-semibold rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(192,38,211,0.5)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 relative overflow-hidden group flex items-center justify-center gap-2"
                            >
                                <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] skew-x-12"></div>
                                <span className="relative z-10 flex items-center justify-center w-full">
                                    {processing ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Logging in...
                                        </>
                                    ) : (
                                        <>
                                            Sign In
                                            <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                        </>
                                    )}
                                </span>
                            </button>
                        </motion.div>
                        
                        {/* OR CONTINUE WITH */}
                        <motion.div variants={itemVariants} className="relative py-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10"></div>
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="px-2 bg-[#090b14] text-gray-500 tracking-widest uppercase">Or continue with</span>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <Link
                                href={route('register')}
                                onClick={handleSwitchPage}
                                className="w-full py-3.5 px-4 flex items-center justify-center gap-2 border border-white/10 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all duration-300 font-medium group"
                            >
                                <svg className="w-5 h-5 text-gray-400 group-hover:text-fuchsia-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                                Create Account
                            </Link>
                        </motion.div>
                    </form>

                    <motion.div variants={itemVariants} className="mt-8 text-center">
                        <p className="text-[11px] text-gray-500 tracking-wider">
                            © 2025 Plant Maintenance System
                        </p>
                    </motion.div>
                </motion.div>
            </div>

            {/* Loading & Transition Overlays */}
            <div 
                className={`fixed inset-0 z-[100] bg-[#050510]/80 backdrop-blur-sm flex flex-col items-center justify-center transition-all duration-500 pointer-events-none ${
                    isEnteringDashboard ? 'opacity-100' : 'opacity-0'
                }`}
            >
                <div className="w-16 h-16 border-4 border-white/10 border-t-blue-500 border-b-fuchsia-500 rounded-full animate-spin"></div>
                <p className="text-white mt-6 font-medium tracking-widest uppercase text-sm animate-pulse">Authenticating...</p>
            </div>

            <div 
                className={`fixed inset-0 z-[100] bg-[#050510] flex flex-col items-center justify-center transition-all duration-500 pointer-events-none ${
                    isSwitchingPage ? 'opacity-100 backdrop-blur-xl' : 'opacity-0'
                }`}
            >
                <div className="relative flex items-center justify-center">
                    <div className="absolute w-32 h-32 bg-fuchsia-500/30 blur-[40px] rounded-full animate-pulse"></div>
                    <div className="absolute w-24 h-24 bg-blue-500/40 blur-[20px] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-16 h-16 border-4 border-transparent border-t-fuchsia-400 border-b-blue-400 rounded-full animate-spin" style={{ animationDuration: '0.8s' }}></div>
                    <div className="absolute inset-2 border-4 border-transparent border-l-blue-400 border-r-fuchsia-400 rounded-full animate-spin" style={{ animationDuration: '1.2s', animationDirection: 'reverse' }}></div>
                </div>
            </div>
            
            <style jsx global>{`
                @keyframes shimmer {
                    100% { transform: translateX(200%); }
                }
            `}</style>
        </div>
    );
}
