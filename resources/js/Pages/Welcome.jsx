import { Head, Link } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';

export default function Welcome({ auth, kpis }) {
    // Default KPIs if not passed
    const defaultKpis = {
        total_unit: 487,
        total_mekanik: 126,
        breakdown: 18,
        open_wo: 34,
        on_process_wo: 27,
        closed_wo: 128
    };

    const finalKpis = kpis || defaultKpis;
    const { total_unit, total_mekanik, breakdown, open_wo, on_process_wo, closed_wo } = finalKpis;

    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 40);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollTo = (e, id) => {
        e.preventDefault();
        const target = document.getElementById(id);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
            setMobileMenuOpen(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800 selection:bg-[#18A957] selection:text-white">
            <Head title="Plant Maintenance System | CMMS" />

            {/* NAVBAR */}
            <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#071A2B] shadow-lg py-3' : 'bg-transparent py-5'}`}>
                <div className="max-w-[1200px] mx-auto px-6 flex justify-between items-center">
                    
                    {/* BRAND */}
                    <a href="#home" onClick={(e) => scrollTo(e, 'home')} className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-lg bg-[#18A957]/10 flex items-center justify-center text-[#18A957] group-hover:bg-[#18A957] group-hover:text-white transition-colors">
                            <i className="fa-solid fa-gears text-xl"></i>
                        </div>
                        <div className="flex flex-col">
                            <strong className="text-white text-xl font-black leading-none tracking-wide">PLANT</strong>
                            <span className="text-gray-300 text-sm font-semibold tracking-widest mt-0.5">MAINTENANCE SYSTEM</span>
                        </div>
                    </a>

                    {/* DESKTOP MENU */}
                    <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold">
                        <a href="#home" onClick={(e) => scrollTo(e, 'home')} className="text-white hover:text-[#18A957] transition-colors">Home</a>
                        <a href="#about" onClick={(e) => scrollTo(e, 'about')} className="text-gray-300 hover:text-white transition-colors">About</a>
                        <a href="#features" onClick={(e) => scrollTo(e, 'features')} className="text-gray-300 hover:text-white transition-colors">Features</a>
                        <a href="#support" onClick={(e) => scrollTo(e, 'support')} className="text-gray-300 hover:text-white transition-colors">Support</a>
                    </nav>

                    {/* LOGIN BUTTON */}
                    <div className="hidden lg:block">
                        {auth?.user ? (
                            <Link href={route('dashboard')} className="flex items-center gap-2 px-5 py-2.5 bg-[#18A957] hover:bg-[#138b46] text-white rounded-lg font-semibold text-sm transition-colors shadow-lg shadow-[#18A957]/20">
                                <span>Dashboard</span>
                                <i className="fa-solid fa-arrow-right"></i>
                            </Link>
                        ) : (
                            <Link href={route('login')} className="flex items-center gap-2 px-5 py-2.5 border-2 border-[#18A957] hover:bg-[#18A957] text-[#18A957] hover:text-white rounded-lg font-bold text-sm transition-colors">
                                <i className="fa-solid fa-arrow-right-to-bracket"></i>
                                <span>Login to System</span>
                            </Link>
                        )}
                    </div>

                    {/* MOBILE MENU BTN */}
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden text-white p-2">
                        <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-2xl`}></i>
                    </button>
                </div>
            </header>

            {/* MOBILE DROPDOWN */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-40 bg-[#071A2B] pt-24 px-6 lg:hidden flex flex-col gap-6">
                    <a href="#home" onClick={(e) => scrollTo(e, 'home')} className="text-white text-xl font-bold">Home</a>
                    <a href="#about" onClick={(e) => scrollTo(e, 'about')} className="text-gray-300 text-xl font-bold">About</a>
                    <a href="#features" onClick={(e) => scrollTo(e, 'features')} className="text-gray-300 text-xl font-bold">Features</a>
                    <a href="#support" onClick={(e) => scrollTo(e, 'support')} className="text-gray-300 text-xl font-bold">Support</a>
                    <div className="pt-6 border-t border-white/10 mt-4">
                        {auth?.user ? (
                            <Link href={route('dashboard')} className="flex items-center justify-center gap-2 w-full py-4 bg-[#18A957] text-white rounded-xl font-bold">
                                Dashboard
                            </Link>
                        ) : (
                            <Link href={route('login')} className="flex items-center justify-center gap-2 w-full py-4 bg-[#18A957] text-white rounded-xl font-bold">
                                Login to System
                            </Link>
                        )}
                    </div>
                </div>
            )}

            <main>
                {/* HERO SECTION */}
                <section id="home" className="relative min-h-screen flex flex-col pt-24 lg:pt-0">
                    
                    {/* Hero Background */}
                    <div className="absolute inset-0 z-0">
                        <img 
                            src="/images/bg-mining.jpg" 
                            alt="Haul Truck" 
                            className="w-full h-full object-cover"
                        />
                        {/* Dark gradient on the left, clear on the right */}
                        <div className="absolute inset-0 bg-gradient-to-r from-[#071A2B]/95 via-[#071A2B]/70 to-transparent"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#071A2B]/50 via-transparent to-transparent"></div>
                    </div>

                    <div className="relative z-10 flex-grow flex items-center">
                        <div className="max-w-[1200px] mx-auto px-6 w-full py-20 lg:py-0">
                            
                            <div className="max-w-2xl mt-12">
                                <h1 className="text-[4rem] lg:text-[5.5rem] font-black leading-[1] mb-6 tracking-tight">
                                    <span className="text-white block drop-shadow-lg">PLANT</span>
                                    <span className="text-[#18A957] block drop-shadow-lg">MAINTENANCE</span>
                                    <span className="text-[#18A957] block drop-shadow-lg">SYSTEM</span>
                                </h1>

                                <h2 className="text-xl lg:text-2xl text-white font-bold mb-4 drop-shadow-md">
                                    Smart Maintenance. Reliable Assets. Better Performance.
                                </h2>

                                <p className="text-gray-200 text-lg mb-10 max-w-xl leading-relaxed drop-shadow-md">
                                    Integrated maintenance management system for equipment, work orders, preventive maintenance, breakdown, manpower and asset reliability.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Link href={route('login')} className="px-8 py-4 bg-[#18A957] hover:bg-[#138b46] text-white rounded-lg font-bold transition-all flex items-center justify-center gap-2">
                                        <i className="fa-solid fa-arrow-right-to-bracket"></i>
                                        <span>Login to System</span>
                                    </Link>
                                    <a href="#features" onClick={(e) => scrollTo(e, 'features')} className="px-8 py-4 bg-transparent hover:bg-white/10 border-2 border-white text-white rounded-lg font-bold transition-all flex items-center justify-center gap-2">
                                        <span>Learn More</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* HERO BENEFITS BAR */}
                    <div className="relative z-10 w-full bg-[#071A2B] border-t border-white/10">
                        <div className="max-w-[1200px] mx-auto px-6 py-6 lg:py-5">
                            <div className="flex flex-wrap lg:flex-nowrap justify-between gap-6 lg:gap-10">
                                
                                <div className="flex items-center gap-3">
                                    <div className="text-white">
                                        <i className="fa-solid fa-gears text-2xl"></i>
                                    </div>
                                    <strong className="text-white text-sm font-bold">Reliable Assets</strong>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="text-white">
                                        <i className="fa-regular fa-clock text-2xl"></i>
                                    </div>
                                    <strong className="text-white text-sm font-bold">Lower Downtime</strong>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="text-white">
                                        <i className="fa-solid fa-chart-column text-2xl"></i>
                                    </div>
                                    <strong className="text-white text-sm font-bold">Higher Productivity</strong>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="text-white">
                                        <i className="fa-solid fa-shield-halved text-2xl"></i>
                                    </div>
                                    <strong className="text-white text-sm font-bold">Safer Operation</strong>
                                </div>

                            </div>
                        </div>
                    </div>
                </section>

                {/* KEY FEATURES */}
                <section id="features" className="bg-white py-24">
                    <div className="max-w-[1200px] mx-auto px-6">
                        <div className="mb-12">
                            <span className="text-gray-400 text-sm font-bold uppercase tracking-widest block mb-1">KEY FEATURES</span>
                            <h2 className="text-3xl font-black text-gray-900 mb-2">Complete Maintenance Management</h2>
                            <p className="text-gray-500">Everything you need to manage your plant maintenance in one integrated system.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Feature 1 */}
                            <div className="bg-white border border-gray-100 p-8 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                                <div className="text-[#18A957] text-3xl mb-4">
                                    <i className="fa-solid fa-wrench"></i>
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2 text-lg">Work Order<br/>Management</h3>
                                <p className="text-gray-500 text-sm">Manage breakdown, corrective and scheduled maintenance.</p>
                            </div>
                            {/* Feature 2 */}
                            <div className="bg-white border border-gray-100 p-8 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                                <div className="text-[#18A957] text-3xl mb-4">
                                    <i className="fa-solid fa-calendar-check"></i>
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2 text-lg">Preventive<br/>Maintenance</h3>
                                <p className="text-gray-500 text-sm">Monitor service intervals and PM schedules.</p>
                            </div>
                            {/* Feature 3 */}
                            <div className="bg-white border border-gray-100 p-8 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                                <div className="text-[#18A957] text-3xl mb-4">
                                    <i className="fa-solid fa-truck"></i>
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2 text-lg">Asset<br/>Management</h3>
                                <p className="text-gray-500 text-sm">Monitor unit, equipment and asset history.</p>
                            </div>
                            {/* Feature 4 */}
                            <div className="bg-white border border-gray-100 p-8 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                                <div className="text-[#18A957] text-3xl mb-4">
                                    <i className="fa-solid fa-chart-column"></i>
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2 text-lg">Maintenance<br/>Analytics</h3>
                                <p className="text-gray-500 text-sm">Track breakdown, downtime and maintenance performance.</p>
                            </div>
                            {/* Feature 5 */}
                            <div className="bg-white border border-gray-100 p-8 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                                <div className="text-gray-400 text-3xl mb-4">
                                    <i className="fa-solid fa-users"></i>
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2 text-lg">Manpower<br/>Management</h3>
                                <p className="text-gray-500 text-sm">Monitor maintenance manpower and workload.</p>
                            </div>
                            {/* Feature 6 */}
                            <div className="bg-white border border-gray-100 p-8 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                                <div className="text-[#18A957] text-3xl mb-4">
                                    <i className="fa-solid fa-shield-halved"></i>
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2 text-lg">Warranty<br/>Management</h3>
                                <p className="text-gray-500 text-sm">Manage warranty claim and vendor follow-up.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* WORKFLOW */}
                <section className="bg-white py-12 pb-24">
                    <div className="max-w-[1200px] mx-auto px-6">
                        <div className="mb-12">
                            <span className="text-gray-400 text-sm font-bold uppercase tracking-widest block mb-1">OUR WORKFLOW</span>
                            <h2 className="text-3xl font-black text-gray-900 mb-2">One Work Order. Complete Maintenance History.</h2>
                            <p className="text-gray-500">From breakdown to close, every step is tracked and recorded.</p>
                        </div>

                        {/* Workflow Items */}
                        <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-y-8">
                            
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-14 h-14 rounded-full bg-red-500 text-white flex items-center justify-center text-xl shadow-lg shadow-red-500/30">
                                    <i className="fa-solid fa-exclamation"></i>
                                </div>
                                <span className="text-sm font-bold text-gray-800">Breakdown</span>
                            </div>
                            <i className="fa-solid fa-arrow-right text-gray-300 hidden lg:block text-sm"></i>

                            <div className="flex flex-col items-center gap-3">
                                <div className="w-14 h-14 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg shadow-lg shadow-blue-500/30">
                                    <i className="fa-solid fa-file-lines"></i>
                                </div>
                                <span className="text-sm font-bold text-gray-800">Work Order</span>
                            </div>
                            <i className="fa-solid fa-arrow-right text-gray-300 hidden lg:block text-sm"></i>

                            <div className="flex flex-col items-center gap-3">
                                <div className="w-14 h-14 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg shadow-lg shadow-blue-500/30">
                                    <i className="fa-solid fa-calendar-days"></i>
                                </div>
                                <span className="text-sm font-bold text-gray-800">Planning</span>
                            </div>
                            <i className="fa-solid fa-arrow-right text-gray-300 hidden lg:block text-sm"></i>

                            <div className="flex flex-col items-center gap-3">
                                <div className="w-14 h-14 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg shadow-lg shadow-blue-500/30">
                                    <i className="fa-solid fa-users"></i>
                                </div>
                                <span className="text-sm font-bold text-gray-800">Assignment</span>
                            </div>
                            <i className="fa-solid fa-arrow-right text-gray-300 hidden lg:block text-sm"></i>

                            <div className="flex flex-col items-center gap-3">
                                <div className="w-14 h-14 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg shadow-lg shadow-blue-500/30">
                                    <i className="fa-solid fa-gears"></i>
                                </div>
                                <span className="text-sm font-bold text-gray-800">Execution</span>
                            </div>
                            <i className="fa-solid fa-arrow-right text-gray-300 hidden lg:block text-sm"></i>

                            <div className="flex flex-col items-center gap-3">
                                <div className="w-14 h-14 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg shadow-lg shadow-blue-500/30">
                                    <i className="fa-solid fa-box"></i>
                                </div>
                                <span className="text-sm font-bold text-gray-800 text-center">Part &<br/>Manpower</span>
                            </div>
                            <i className="fa-solid fa-arrow-right text-gray-300 hidden lg:block text-sm"></i>

                            <div className="flex flex-col items-center gap-3">
                                <div className="w-14 h-14 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg shadow-lg shadow-blue-500/30">
                                    <i className="fa-solid fa-clipboard-check"></i>
                                </div>
                                <span className="text-sm font-bold text-gray-800">Completion</span>
                            </div>
                            <i className="fa-solid fa-arrow-right text-gray-300 hidden lg:block text-sm"></i>

                            <div className="flex flex-col items-center gap-3">
                                <div className="w-14 h-14 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg shadow-lg shadow-blue-500/30">
                                    <i className="fa-solid fa-magnifying-glass"></i>
                                </div>
                                <span className="text-sm font-bold text-gray-800">Verification</span>
                            </div>
                            <i className="fa-solid fa-arrow-right text-gray-300 hidden lg:block text-sm"></i>

                            <div className="flex flex-col items-center gap-3">
                                <div className="w-14 h-14 rounded-full bg-green-500 text-white flex items-center justify-center text-xl shadow-lg shadow-green-500/30">
                                    <i className="fa-solid fa-check"></i>
                                </div>
                                <span className="text-sm font-bold text-gray-800">Closed</span>
                            </div>
                            <i className="fa-solid fa-arrow-right text-gray-300 hidden lg:block text-sm"></i>

                            <div className="flex flex-col items-center gap-3">
                                <div className="w-14 h-14 rounded-full bg-[#071A2B] text-white flex items-center justify-center text-lg shadow-lg shadow-[#071A2B]/30">
                                    <i className="fa-solid fa-database"></i>
                                </div>
                                <span className="text-sm font-bold text-gray-800">History</span>
                            </div>

                        </div>
                    </div>
                </section>

                {/* SYSTEM OVERVIEW KPI */}
                <section className="bg-gray-50 py-24 border-t border-gray-100">
                    <div className="max-w-[1200px] mx-auto px-6">
                        <div className="mb-12">
                            <span className="text-gray-400 text-sm font-bold uppercase tracking-widest block mb-1">SYSTEM OVERVIEW</span>
                            <h2 className="text-3xl font-black text-gray-900 mb-2">Real Data. Real Impact.</h2>
                            <p className="text-gray-500">Monitor your assets and maintenance activities in real time.</p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                            
                            <div className="bg-white border border-gray-100 p-4 rounded-xl flex items-center gap-3 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)]">
                                <div className="w-10 h-10 rounded-lg bg-green-500 text-white flex items-center justify-center text-lg shrink-0">
                                    <i className="fa-solid fa-truck"></i>
                                </div>
                                <div>
                                    <div className="text-xl font-black text-gray-900 leading-none mb-1">{total_unit}</div>
                                    <div className="text-xs font-bold text-gray-500">Total Unit</div>
                                </div>
                            </div>

                            <div className="bg-white border border-gray-100 p-4 rounded-xl flex items-center gap-3 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)]">
                                <div className="w-10 h-10 rounded-lg bg-blue-500 text-white flex items-center justify-center text-lg shrink-0">
                                    <i className="fa-solid fa-users"></i>
                                </div>
                                <div>
                                    <div className="text-xl font-black text-gray-900 leading-none mb-1">{total_mekanik}</div>
                                    <div className="text-xs font-bold text-gray-500">Total Mekanik</div>
                                </div>
                            </div>

                            <div className="bg-white border border-gray-100 p-4 rounded-xl flex items-center gap-3 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)]">
                                <div className="w-10 h-10 rounded-lg bg-red-500 text-white flex items-center justify-center text-lg shrink-0">
                                    <i className="fa-solid fa-wrench"></i>
                                </div>
                                <div>
                                    <div className="text-xl font-black text-gray-900 leading-none mb-1">{breakdown}</div>
                                    <div className="text-xs font-bold text-gray-500">Breakdown</div>
                                </div>
                            </div>

                            <div className="bg-white border border-gray-100 p-4 rounded-xl flex items-center gap-3 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)]">
                                <div className="w-10 h-10 rounded-lg bg-orange-400 text-white flex items-center justify-center text-lg shrink-0">
                                    <i className="fa-solid fa-file-lines"></i>
                                </div>
                                <div>
                                    <div className="text-xl font-black text-gray-900 leading-none mb-1">{open_wo}</div>
                                    <div className="text-xs font-bold text-gray-500">Open Work Order</div>
                                </div>
                            </div>

                            <div className="bg-white border border-gray-100 p-4 rounded-xl flex items-center gap-3 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)]">
                                <div className="w-10 h-10 rounded-lg bg-yellow-400 text-white flex items-center justify-center text-lg shrink-0">
                                    <i className="fa-solid fa-gears"></i>
                                </div>
                                <div>
                                    <div className="text-xl font-black text-gray-900 leading-none mb-1">{on_process_wo}</div>
                                    <div className="text-xs font-bold text-gray-500">On Process</div>
                                </div>
                            </div>

                            <div className="bg-white border border-gray-100 p-4 rounded-xl flex items-center gap-3 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)]">
                                <div className="w-10 h-10 rounded-lg bg-green-500 text-white flex items-center justify-center text-lg shrink-0">
                                    <i className="fa-solid fa-check"></i>
                                </div>
                                <div>
                                    <div className="text-xl font-black text-gray-900 leading-none mb-1">{closed_wo}</div>
                                    <div className="text-xs font-bold text-gray-500">Closed</div>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

            </main>

            {/* FOOTER */}
            <footer className="bg-[#071A2B] text-gray-300">
                <div className="max-w-[1200px] mx-auto px-6">
                    {/* Top part of footer */}
                    <div className="py-16 flex flex-col lg:flex-row justify-between gap-12">
                        
                        <div className="lg:max-w-xs">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-lg bg-[#18A957]/10 flex items-center justify-center text-[#18A957]">
                                    <i className="fa-solid fa-gears text-xl"></i>
                                </div>
                                <div className="flex flex-col">
                                    <strong className="text-white text-xl font-black leading-none tracking-wide">PLANT</strong>
                                    <span className="text-gray-400 text-sm font-semibold tracking-widest mt-0.5">MAINTENANCE SYSTEM</span>
                                </div>
                            </div>
                            <p className="text-sm leading-relaxed mb-6">
                                Maintaining Today.<br/>For a Stronger Tomorrow.
                            </p>
                        </div>

                        <div className="flex flex-col lg:items-end lg:text-right gap-1 text-sm font-semibold text-gray-400 justify-center">
                            <span>Reliable People</span>
                            <span>Reliable Assets</span>
                            <span>Sustainable Operation</span>
                        </div>
                        
                    </div>

                    {/* Bottom part of footer */}
                    <div className="py-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-medium text-gray-500">
                        <div>© 2026 Plant Maintenance System. All rights reserved.</div>
                        <div className="flex items-center gap-6">
                            <a href="#" className="hover:text-white transition-colors">Privacy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms</a>
                            <a href="#" className="hover:text-white transition-colors">Contact</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
