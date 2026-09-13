import { Head, Link, useForm, router } from '@inertiajs/react';
import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    
    const [isInitializing, setIsInitializing] = useState(false);
    const [isSwitchingPage, setIsSwitchingPage] = useState(false);

    const handleSwitchPage = (e) => {
        e.preventDefault();
        setIsSwitchingPage(true);
        setTimeout(() => {
            router.visit(route('login'));
        }, 800);
    };

    const submit = (e) => {
        e.preventDefault();
        
        setIsInitializing(true);
        
        setTimeout(() => {
            post(route('register'), {
                onFinish: () => {
                    reset('password', 'password_confirmation');
                },
                onError: () => {
                    setIsInitializing(false);
                }
            });
        }, 1200);
    };

    // Smooth animation variants
    const containerVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1, 
            scale: 1,
            transition: { duration: 0.5, staggerChildren: 0.08, delayChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#050510] font-sans overflow-hidden relative py-12">
            <Head title="Register" />

            {/* NEON BACKGROUND ANIMATIONS */}
            {/* Dark background base */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#1b1035_0%,#050510_100%)] z-0"></div>

            {/* Floating Neon Orbs */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[5%] right-[15%] w-[400px] h-[400px] bg-blue-600/20 blur-[120px] rounded-full animate-pulse" style={{ animationDuration: '7s' }}></div>
                <div className="absolute bottom-[5%] left-[15%] w-[500px] h-[500px] bg-fuchsia-600/20 blur-[120px] rounded-full animate-pulse" style={{ animationDuration: '9s' }}></div>
                
                {/* Floating Neon Particles */}
                <div className="absolute top-1/4 right-1/3 w-2 h-2 bg-blue-400 rounded-full blur-[2px] shadow-[0_0_15px_3px_rgba(96,165,250,0.8)] animate-[float_4s_ease-in-out_infinite]"></div>
                <div className="absolute top-2/3 left-1/4 w-3 h-3 bg-fuchsia-400 rounded-full blur-[2px] shadow-[0_0_20px_4px_rgba(232,121,249,0.8)] animate-[float_6s_ease-in-out_infinite_reverse]"></div>
                <div className="absolute bottom-1/4 right-1/2 w-1.5 h-1.5 bg-cyan-400 rounded-full blur-[1px] shadow-[0_0_10px_2px_rgba(34,211,238,0.8)] animate-[float_3s_ease-in-out_infinite]"></div>
            </div>

            {/* Main Centered Content */}
            <div className="w-full px-6 flex flex-col justify-center items-center relative z-10">
                
                {/* Logo/Brand */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col items-center gap-3 mb-8"
                >
                    <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(192,38,211,0.5)] border border-white/20 relative overflow-hidden">
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"></div>
                        <svg className="w-6 h-6 text-white relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                           <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                    <span className="font-extrabold text-white text-xl tracking-wide drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">
                        Create Account
                    </span>
                </motion.div>

                {/* Animated Neon Rotating Border Wrapper */}
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="relative w-full max-w-[440px] rounded-[24px] p-[2px] overflow-hidden group shadow-[0_10px_50px_-10px_rgba(59,130,246,0.3)]"
                >
                    {/* Rotating conic gradients for the glowing neon border */}
                    <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0_300deg,#3b82f6_360deg)] animate-[spin_4s_linear_infinite]"></div>
                    <div className="absolute inset-[-100%] bg-[conic-gradient(from_180deg,transparent_0_300deg,#d946ef_360deg)] animate-[spin_4s_linear_infinite]"></div>
                    
                    {/* Inner Glassmorphism Card */}
                    <div className="relative bg-[#0b0c16]/95 backdrop-blur-2xl rounded-[22px] p-8 sm:p-10 w-full z-10">
                        
                        <motion.div variants={itemVariants} className="mb-6 text-center">
                            <h2 className="text-xl font-bold text-white">Join System Plant</h2>
                            <p className="text-gray-400 text-sm mt-1.5">Sign up to get started</p>
                        </motion.div>

                        <form onSubmit={submit} className="space-y-4">
                            
                            {/* Name Input */}
                            <motion.div variants={itemVariants} className="space-y-1.5">
                                <label className="block text-sm font-medium text-gray-300">Full Name</label>
                                <input
                                    id="name"
                                    type="text"
                                    name="name"
                                    value={data.name}
                                    autoComplete="name"
                                    autoFocus
                                    required
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none transition-all duration-300 focus:bg-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] focus:shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                                    placeholder="John Doe"
                                />
                                {errors.name && <p className="text-sm text-red-400 font-medium">{errors.name}</p>}
                            </motion.div>

                            {/* Email Input */}
                            <motion.div variants={itemVariants} className="space-y-1.5">
                                <label className="block text-sm font-medium text-gray-300">Email Address</label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    autoComplete="username"
                                    required
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none transition-all duration-300 focus:bg-white/10 focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] focus:shadow-[0_0_15px_rgba(217,70,239,0.3)]"
                                    placeholder="you@example.com"
                                />
                                {errors.email && <p className="text-sm text-red-400 font-medium">{errors.email}</p>}
                            </motion.div>

                            {/* Password Input */}
                            <motion.div variants={itemVariants} className="space-y-1.5">
                                <label className="block text-sm font-medium text-gray-300">Password</label>
                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    autoComplete="new-password"
                                    required
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none transition-all duration-300 focus:bg-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] focus:shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                                    placeholder="••••••••"
                                />
                                {errors.password && <p className="text-sm text-red-400 font-medium">{errors.password}</p>}
                            </motion.div>

                            {/* Confirm Password Input */}
                            <motion.div variants={itemVariants} className="space-y-1.5">
                                <label className="block text-sm font-medium text-gray-300">Confirm Password</label>
                                <input
                                    id="password_confirmation"
                                    type="password"
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    autoComplete="new-password"
                                    required
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none transition-all duration-300 focus:bg-white/10 focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] focus:shadow-[0_0_15px_rgba(217,70,239,0.3)]"
                                    placeholder="••••••••"
                                />
                                {errors.password_confirmation && <p className="text-sm text-red-400 font-medium">{errors.password_confirmation}</p>}
                            </motion.div>

                            {/* Submit Button */}
                            <motion.div variants={itemVariants} className="pt-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-fuchsia-600 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 relative overflow-hidden group"
                                >
                                    <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] skew-x-12"></div>
                                    <span className="relative z-10 flex items-center justify-center">
                                        {processing ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Creating Account...
                                            </>
                                        ) : (
                                            'Sign Up'
                                        )}
                                    </span>
                                </button>
                            </motion.div>
                            
                            <motion.div variants={itemVariants} className="text-center pt-5 mt-2 border-t border-white/10">
                                <p className="text-sm text-gray-400">
                                    Already have an account? {' '}
                                    <a href={route('login')} onClick={handleSwitchPage} className="text-blue-400 font-semibold hover:text-blue-300 hover:underline transition-all cursor-pointer">
                                        Sign In
                                    </a>
                                </p>
                            </motion.div>
                        </form>
                    </div>
                </motion.div>
            </div>

            {/* Simple Elegant Loading Overlay for Register */}
            <div 
                className={`fixed inset-0 z-[100] bg-[#050510]/80 backdrop-blur-sm flex flex-col items-center justify-center transition-all duration-500 pointer-events-none ${
                    isInitializing ? 'opacity-100' : 'opacity-0'
                }`}
            >
                <div className="w-16 h-16 border-4 border-white/10 border-t-fuchsia-500 border-b-blue-500 rounded-full animate-spin"></div>
                <p className="text-white mt-6 font-medium tracking-widest uppercase text-sm animate-pulse">Initializing...</p>
            </div>

            {/* Switching Page Animation Overlay */}
            <div 
                className={`fixed inset-0 z-[100] bg-[#050510] flex flex-col items-center justify-center transition-all duration-500 pointer-events-none ${
                    isSwitchingPage ? 'opacity-100 backdrop-blur-xl' : 'opacity-0'
                }`}
            >
                {/* Glowing portal effect */}
                <div className="relative flex items-center justify-center">
                    <div className="absolute w-32 h-32 bg-blue-500/30 blur-[40px] rounded-full animate-pulse"></div>
                    <div className="absolute w-24 h-24 bg-fuchsia-500/40 blur-[20px] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-16 h-16 border-4 border-transparent border-t-blue-400 border-b-fuchsia-400 rounded-full animate-spin" style={{ animationDuration: '0.8s' }}></div>
                    <div className="absolute inset-2 border-4 border-transparent border-l-fuchsia-400 border-r-blue-400 rounded-full animate-spin" style={{ animationDuration: '1.2s', animationDirection: 'reverse' }}></div>
                </div>
                <p className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-blue-400 mt-8 font-bold tracking-[0.2em] uppercase text-sm animate-pulse">
                    Returning to Login...
                </p>
                <div className="mt-4 w-40 h-1 bg-white/10 rounded-full overflow-hidden relative">
                    <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-fuchsia-500 to-blue-500 -translate-x-full animate-[shimmer_0.8s_ease-in-out_infinite]"></div>
                </div>
            </div>
            
            <style jsx global>{`
                @keyframes shimmer {
                    100% { transform: translateX(200%); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0) translateX(0); }
                    50% { transform: translateY(-20px) translateX(10px); }
                }
            `}</style>
        </div>
    );
}
