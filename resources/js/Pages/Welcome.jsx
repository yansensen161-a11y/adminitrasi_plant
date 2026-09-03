import { Head, Link } from '@inertiajs/react';
import React from 'react';

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    return (
        <>
            <Head title="Monitoring Plant - Mining Management System" />
            
            <div className="min-h-screen bg-[#050B14] text-white font-sans selection:bg-cyan-500 selection:text-black">
                
                {/* Background Image Setup */}
                <div className="fixed inset-0 z-0">
                    <img 
                        src="/images/bg-mining.jpg" 
                        alt="Mining Background" 
                        className="w-full h-full object-cover opacity-40 mix-blend-luminosity"
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#050B14]/70 via-[#050B14]/80 to-[#050B14] z-10"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#050B14] via-transparent to-transparent z-10"></div>
                </div>

                <div className="relative z-10 flex flex-col min-h-screen max-w-[1600px] mx-auto">
                    {/* NAVBAR */}
                    <header className="px-6 py-5 flex items-center justify-between border-b border-white/5 bg-transparent">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-yellow-400 rounded-md flex items-center justify-center">
                                <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-lg tracking-wider leading-none mb-1">MONITORING PLANT</span>
                                <span className="text-[10px] text-gray-400 tracking-widest uppercase leading-none">Mining Management System</span>
                            </div>
                        </div>

                        <nav className="hidden lg:flex items-center gap-10 text-[11px] font-bold tracking-widest uppercase text-gray-400">
                            <a href="#" className="text-yellow-400 border-b-2 border-yellow-400 pb-1">HOME</a>
                            <a href="#" className="hover:text-white transition-colors">FEATURES</a>
                            <a href="#" className="hover:text-white transition-colors">PORTFOLIO</a>
                            <a href="#" className="hover:text-white transition-colors">ABOUT</a>
                            <a href="#" className="hover:text-white transition-colors">CONTACT</a>
                        </nav>

                        <div className="flex items-center gap-4">
                            {auth?.user ? (
                                <Link href={route('dashboard')} className="px-6 py-2.5 text-xs font-bold tracking-wider border border-cyan-500/50 text-cyan-400 rounded hover:bg-cyan-500/10 transition-colors">
                                    DASHBOARD →
                                </Link>
                            ) : (
                                <>
                                    <Link href={route('login')} className="px-6 py-2.5 text-xs font-bold tracking-wider border border-cyan-500/30 text-cyan-400 rounded hover:bg-cyan-500/10 transition-colors flex items-center gap-2">
                                        LOG IN →
                                    </Link>
                                    <Link href={route('register')} className="px-6 py-2.5 text-xs font-bold tracking-wider bg-yellow-400 text-black rounded hover:bg-yellow-300 transition-colors flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        REGISTER →
                                    </Link>
                                </>
                            )}
                        </div>
                    </header>

                    {/* HERO & MAIN */}
                    <main className="flex-1 px-6 pt-16 pb-12 flex flex-col justify-between">
                        
                        <div className="grid lg:grid-cols-12 gap-8 items-center flex-1">
                            
                            {/* Left content */}
                            <div className="lg:col-span-8">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-[10px] font-bold tracking-widest mb-8">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    SYSTEM ONLINE • NEXT GENERATION
                                </div>
                                
                                <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6">
                                    MASTER YOUR <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-cyan-400">PLANT OPERATION</span>
                                </h1>

                                <p className="text-gray-400 text-lg max-w-2xl mb-10 leading-relaxed font-light">
                                    Real-time monitoring and smart management solution<br/> 
                                    for mining equipment and plant operations.<br/> 
                                    More control. More efficiency. Better performance.
                                </p>

                                <div className="flex gap-4">
                                    <button className="px-8 py-4 bg-yellow-400 text-black text-sm font-bold rounded flex items-center gap-2 hover:bg-yellow-300 transition-colors">
                                        EXPLORE SYSTEM →
                                    </button>
                                    <button className="px-8 py-4 border border-cyan-500/50 text-cyan-400 text-sm font-bold rounded flex items-center gap-3 hover:bg-cyan-500/10 transition-colors">
                                        VIEW PORTFOLIO 
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
                                    </button>
                                </div>
                            </div>

                            {/* Right floating badges */}
                            <div className="lg:col-span-4 flex flex-col gap-6 items-end justify-center hidden lg:flex">
                                <div className="flex items-center gap-5 pr-4">
                                    <div className="w-12 h-12 rounded-full border border-cyan-500/50 flex items-center justify-center text-cyan-400 bg-[#050B14]/80 backdrop-blur-md">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                    </div>
                                    <div>
                                        <div className="text-[11px] text-gray-400 uppercase font-bold tracking-widest mb-1">Safety First</div>
                                        <div className="text-[13px] text-white">Zero Accident</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-5 pr-4">
                                    <div className="w-12 h-12 rounded-full border border-yellow-500/50 flex items-center justify-center text-yellow-400 bg-[#050B14]/80 backdrop-blur-md">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    </div>
                                    <div>
                                        <div className="text-[11px] text-yellow-500 uppercase font-bold tracking-widest mb-1">High Performance</div>
                                        <div className="text-[13px] text-white">Maximum Productivity</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-5 pr-4">
                                    <div className="w-12 h-12 rounded-full border border-cyan-500/50 flex items-center justify-center text-cyan-400 bg-[#050B14]/80 backdrop-blur-md">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
                                    </div>
                                    <div>
                                        <div className="text-[11px] text-cyan-500 uppercase font-bold tracking-widest mb-1">Smart Decision</div>
                                        <div className="text-[13px] text-white">Data Driven</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* STATS ROW */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-16 mb-4">
                            {[
                                { title: "TOTAL UNIT", value: "124", sub: "Active Unit", icon: <svg className="w-7 h-7 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg> },
                                { title: "TOTAL MAINTENANCE", value: "386", sub: "This Month", icon: <svg className="w-7 h-7 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
                                { title: "AVAILABILITY", value: "89.6%", sub: "This Month", icon: <svg className="w-7 h-7 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
                                { title: "FUEL EFFICIENCY", value: "17.2", sub: "Liter / Hour", icon: <svg className="w-7 h-7 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg> },
                                { title: "OPERATING HOURS", value: "12,846", sub: "This Month", icon: <svg className="w-7 h-7 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
                                { title: "OPEN WORK ORDER", value: "23", sub: "Items", icon: <svg className="w-7 h-7 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg> }
                            ].map((stat, idx) => (
                                <div key={idx} className="bg-[#050B14]/80 backdrop-blur-md border border-white/5 rounded-xl p-5 hover:border-cyan-500/30 transition-colors flex items-center gap-4">
                                    <div className="opacity-90">
                                        {stat.icon}
                                    </div>
                                    <div>
                                        <div className="text-[9px] text-gray-400 font-bold tracking-widest uppercase mb-1">{stat.title}</div>
                                        <div className="text-[22px] font-bold text-white leading-none mb-1">{stat.value}</div>
                                        <div className="text-[11px] text-gray-500">{stat.sub}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* BOTTOM FEATURES CARDS */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                            {[
                                { title: "REAL TIME MONITORING", desc: "Monitor all equipment and plant activities in real-time with live data from the field.", icon: <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>, color: "cyan" },
                                { title: "MAINTENANCE CONTROL", desc: "Plan, schedule, and track maintenance to reduce downtime and extend equipment life.", icon: <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>, color: "yellow" },
                                { title: "PERFORMANCE ANALYTICS", desc: "Get insights and reports to improve performance and support data-driven decision making.", icon: <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>, color: "cyan" },
                                { title: "SAFETY MANAGEMENT", desc: "Ensure compliance and promote a safe working environment across all operations.", icon: <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>, color: "yellow" }
                            ].map((feature, idx) => (
                                <div key={idx} className={`bg-[#050B14]/90 backdrop-blur-md border ${feature.color === 'cyan' ? 'border-cyan-500/20 hover:border-cyan-500/50' : 'border-yellow-500/20 hover:border-yellow-500/50'} rounded-xl overflow-hidden group transition-colors flex h-[140px]`}>
                                    
                                    <div className="w-[35%] relative">
                                        <div className="absolute inset-0 bg-[#1a2235]"></div> {/* Fallback color */}
                                        <img src={`/images/feature-${idx+1}.jpg`} className="absolute inset-0 w-full h-full object-cover opacity-70 mix-blend-luminosity" alt="" onError={(e) => e.target.style.display='none'} />
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#050B14]/50 to-[#050B14]"></div>
                                    </div>

                                    <div className="w-[65%] p-4 flex flex-col justify-center">
                                        <div className="mb-2">
                                            {feature.icon}
                                        </div>
                                        <h3 className={`text-[10px] font-bold ${feature.color === 'cyan' ? 'text-cyan-400' : 'text-yellow-400'} tracking-wider mb-1.5`}>
                                            {feature.title}
                                        </h3>
                                        <p className="text-gray-400 text-[10px] mb-2 line-clamp-3 leading-relaxed">
                                            {feature.desc}
                                        </p>
                                        <a href="#" className={`text-[10px] font-bold ${feature.color === 'cyan' ? 'text-cyan-400 hover:text-cyan-300' : 'text-yellow-400 hover:text-yellow-300'} flex items-center gap-1 mt-auto group-hover:gap-2 transition-all`}>
                                            Learn More 
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </main>
                </div>
            </div>
        </>
    );
}
