import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    return (
        <>
            <Head title="Welcome" />
            <div className="min-h-screen bg-gray-950 text-white selection:bg-sky-500 selection:text-white font-sans overflow-x-hidden">
                {/* Background gradient effects */}
                <div className="fixed inset-0 z-0">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/20 rounded-full blur-[128px] opacity-70"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[128px] opacity-70"></div>
                </div>

                <div className="relative z-10 flex min-h-screen flex-col">
                    {/* Navigation */}
                    <header className="flex items-center justify-between px-8 py-6 backdrop-blur-md bg-white/5 border-b border-white/10 sticky top-0 z-50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-400 to-violet-600 flex items-center justify-center font-bold text-xl shadow-lg shadow-sky-500/20">
                                P
                            </div>
                            <span className="font-bold text-xl tracking-tight">System Plant</span>
                        </div>
                        <nav className="flex gap-4">
                            {auth?.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all font-medium text-sm backdrop-blur-sm border border-white/5"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="px-5 py-2 rounded-full hover:bg-white/10 transition-all font-medium text-sm"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="px-5 py-2 rounded-full bg-gradient-to-r from-sky-500 to-violet-600 hover:opacity-90 transition-opacity font-medium text-sm shadow-lg shadow-sky-500/25"
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </nav>
                    </header>

                    {/* Hero Section */}
                    <main className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-32 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="inline-block mb-4 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm font-medium tracking-wide"
                        >
                            🚀 Welcome to the Future
                        </motion.div>
                        
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 max-w-4xl leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500"
                        >
                            Manage Your Plant System with Elegance
                        </motion.h1>
                        
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                            className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl leading-relaxed"
                        >
                            A state-of-the-art platform designed to streamline your workflow, boost productivity, and give you complete control over your systems.
                        </motion.p>
                        
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                            className="flex flex-col sm:flex-row gap-4"
                        >
                            <Link href={route('register')} className="px-8 py-4 rounded-full bg-white text-gray-900 font-semibold hover:bg-gray-100 transition-colors shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                                Get Started
                            </Link>
                            <a href="#features" className="px-8 py-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors font-semibold backdrop-blur-sm">
                                Learn More
                            </a>
                        </motion.div>
                    </main>

                    {/* Features Section */}
                    <div id="features" className="max-w-7xl mx-auto px-6 py-24 w-full">
                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                { title: "Fast & Secure", desc: "Built on Laravel with industry-leading security practices.", icon: "⚡" },
                                { title: "Modern Stack", desc: "React, Inertia, and Tailwind v4 powering a seamless UX.", icon: "⚛️" },
                                { title: "Highly Scalable", desc: "Designed to grow alongside your expanding operations.", icon: "📈" }
                            ].map((feature, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                                    whileHover={{ y: -5, backgroundColor: "rgba(255,255,255,0.08)" }}
                                    className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm transition-all"
                                >
                                    <div className="text-4xl mb-6">{feature.icon}</div>
                                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                                    <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <footer className="mt-auto border-t border-white/10 bg-black/20 backdrop-blur-md py-8 text-center text-gray-500 text-sm">
                        <p>Laravel v{laravelVersion} (PHP v{phpVersion})</p>
                        <p className="mt-2">© {new Date().getFullYear()} Project System Plant. All rights reserved.</p>
                    </footer>
                </div>
            </div>
        </>
    );
}
