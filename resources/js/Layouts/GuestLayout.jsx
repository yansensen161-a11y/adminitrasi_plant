import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import Excavator3D from '../Components/Excavator3D';

export default function Guest({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-aurora px-6 sm:pt-0 relative overflow-hidden">
            {/* 3D Scene Background */}
            <div className="absolute inset-0 z-0">
                <Excavator3D />
            </div>

            {/* Floating Orbs */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[10%] right-[20%] w-[400px] h-[400px] bg-emerald-600/12 rounded-full blur-[120px] animate-float-slow"></div>
                <div className="absolute bottom-[15%] left-[15%] w-[350px] h-[350px] bg-teal-500/10 rounded-full blur-[100px] animate-float-medium"></div>
                <div className="absolute top-[50%] left-[50%] w-[300px] h-[300px] bg-sky-500/8 rounded-full blur-[100px] animate-float-fast"></div>
            </div>

            {/* Floating Particles */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] left-[10%] w-1 h-1 bg-emerald-400/40 rounded-full animate-float-slow"></div>
                <div className="absolute top-[40%] right-[25%] w-1.5 h-1.5 bg-sky-400/30 rounded-full animate-float-medium"></div>
                <div className="absolute bottom-[30%] left-[40%] w-1 h-1 bg-teal-400/40 rounded-full animate-float-fast"></div>
                <div className="absolute top-[15%] right-[40%] w-0.5 h-0.5 bg-emerald-300/50 rounded-full animate-float-medium" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-[20%] right-[15%] w-1 h-1 bg-sky-300/30 rounded-full animate-float-slow" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-[60%] left-[20%] w-0.5 h-0.5 bg-teal-300/50 rounded-full animate-float-fast" style={{ animationDelay: '3s' }}></div>
            </div>

            {/* Grid Pattern Overlay */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '60px 60px'
                }}
            ></div>

            {/* Logo / Brand */}
            <motion.div 
                initial={{ opacity: 0, y: -30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="z-10 mb-10"
            >
                <Link href="/" className="flex flex-col items-center gap-4">
                    <div className="relative">
                        {/* Glow ring behind logo */}
                        <div className="absolute -inset-3 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 rounded-2xl blur-xl"></div>
                        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-sky-500 flex items-center justify-center shadow-2xl shadow-emerald-500/30 ring-1 ring-white/10">
                            <svg className="w-8 h-8 text-white fill-current" viewBox="0 0 24 24">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                        </div>
                    </div>
                    <div className="text-center">
                        <span className="font-extrabold text-3xl tracking-tight text-white block">System Plant</span>
                        <span className="text-sm uppercase font-bold tracking-[0.3em] text-emerald-400/80 mt-1 block">Operations Platform</span>
                    </div>
                </Link>
            </motion.div>

            {/* Form Card */}
            <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
                className="z-10 w-full overflow-hidden glass-card px-8 py-10 shadow-[0_8px_60px_rgba(0,0,0,0.5)] sm:max-w-md rounded-2xl relative"
            >
                {/* Subtle top gradient accent line */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
                
                {children}
            </motion.div>

            {/* Footer text */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="z-10 mt-8 text-sm text-gray-600"
            >
                &copy; {new Date().getFullYear()} System Plant &mdash; All rights reserved.
            </motion.p>
        </div>
    );
}
