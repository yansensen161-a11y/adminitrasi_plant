import React, { useEffect, useState } from 'react';
import { Shield, Activity, Cpu, Radio, Sparkles, Terminal } from 'lucide-react';

export default function EngineCoreHUD({
    phase = 'init',
    isWarping = false,
    onInitComplete = () => {},
    reducedMotion = false,
}) {
    const [bootText, setBootText] = useState('INITIALIZING ENGINE CORE...');
    const [bootProgress, setBootProgress] = useState(12);

    useEffect(() => {
        if (reducedMotion) {
            onInitComplete();
            return;
        }

        if (phase === 'init') {
            const timer1 = setTimeout(() => {
                setBootText('CALIBRATING NEURAL CORE & PORTAL...');
                setBootProgress(64);
            }, 600);

            const timer2 = setTimeout(() => {
                setBootText('SYSTEM ONLINE // FORMING PORTAL MATRIX');
                setBootProgress(100);
            }, 1200);

            const timer3 = setTimeout(() => {
                onInitComplete();
            }, 1800);

            return () => {
                clearTimeout(timer1);
                clearTimeout(timer2);
                clearTimeout(timer3);
            };
        }
    }, [phase, reducedMotion, onInitComplete]);

    return (
        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between overflow-hidden p-6 md:p-10 select-none">
            {/* ─── PHASE 01: FULLSCREEN BOOT OVERLAY ─── */}
            <div
                className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black transition-opacity duration-700 ${
                    phase === 'init' ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
            >
                <div className="flex flex-col items-center max-w-md px-6 text-center">
                    <div className="relative mb-6">
                        <div className="w-16 h-16 rounded-xl border border-white/40 bg-white/5 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.25)] animate-pulse">
                            <Terminal className="w-8 h-8 text-white" />
                        </div>
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                        </span>
                    </div>

                    <h2 className="text-white font-mono text-base md:text-lg tracking-[0.3em] uppercase font-bold flex items-center gap-2">
                        {bootText}
                        <span className="inline-block w-2 h-4 bg-white animate-pulse"></span>
                    </h2>

                    <p className="text-gray-400 font-mono text-xs tracking-widest mt-3">
                        [ SYSTEM_VER: 4.9.1 // CORE_STATE: ENGAGED ]
                    </p>

                    <div className="w-64 h-1 bg-gray-900 rounded-full mt-6 overflow-hidden border border-white/30">
                        <div
                            className="h-full bg-gradient-to-r from-gray-400 via-white to-gray-200 transition-all duration-500 shadow-[0_0_12px_#ffffff]"
                            style={{ width: `${bootProgress}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* ─── TOP HEADER HUD ─── */}
            <header className={`flex items-center justify-between transition-all duration-1000 ${
                phase === 'init' ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'
            }`}>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded border border-white/30 bg-white/5 flex items-center justify-center backdrop-blur shadow-[0_0_15px_rgba(255,255,255,0.15)]">
                        <Cpu className="w-4 h-4 text-white animate-pulse" />
                    </div>
                    <div>
                        <div className="text-white font-mono font-bold text-xs tracking-[0.25em] flex items-center gap-2">
                            <span>ENGINE CORE</span>
                            <span className="text-gray-400 text-[10px] font-normal">// 01</span>
                        </div>
                        <div className="text-gray-400 text-[9px] font-mono tracking-widest uppercase">
                            Plant Maintenance OS
                        </div>
                    </div>
                </div>

                <div className="hidden sm:flex items-center gap-6 font-mono text-[10px] tracking-wider text-gray-400">
                    <div className="flex items-center gap-2 border border-white/20 bg-black/40 px-3 py-1 rounded backdrop-blur">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse"></span>
                        <span className="text-gray-300">CORE STATUS: OPTIMAL</span>
                    </div>
                    <div className="hidden lg:flex items-center gap-2 border border-white/20 bg-black/30 px-3 py-1 rounded backdrop-blur">
                        <Radio className="w-3 h-3 text-white animate-spin" style={{ animationDuration: '6s' }} />
                        <span className="text-gray-400">FREQ: 144.2 MHZ</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/80">
                        <Shield className="w-3 h-3" />
                        <span>SEC_AUTH 4096</span>
                    </div>
                </div>
            </header>

            {/* ─── MAIN HEADLINE & SUBTITLE (Top Center) ─── */}
            <div className="mt-4 sm:mt-6 mb-auto mx-auto max-w-3xl text-center flex flex-col items-center px-4">
                <div className={`space-y-2.5 sm:space-y-3.5 transition-all duration-1000 delay-300 flex flex-col items-center ${
                    phase === 'active' || phase === 'ready'
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 -translate-y-6'
                }`}>
                    {/* Classification Tag */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/30 bg-white/5 backdrop-blur-md shadow-[0_0_12px_rgba(255,255,255,0.15)]">
                        <Activity className="w-3 h-3 text-white animate-pulse" />
                        <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.2em] text-white">
                            NEXT-GEN PLANT MAINTENANCE SYSTEM
                        </span>
                    </div>

                    {/* MAIN HEADLINE */}
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black tracking-tight text-white uppercase font-sans leading-tight text-center">
                        PLANNED FOR{' '}
                        <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(255,255,255,0.7)]">
                            PERFORMANCE.
                        </span>
                    </h1>

                    {/* SUBTITLE */}
                    <p className="text-[10px] sm:text-xs lg:text-sm font-mono tracking-[0.25em] text-gray-400 uppercase font-semibold text-center">
                        PLANT MAINTENANCE MANAGEMENT SYSTEM
                    </p>

                    {/* Tech Badges / Telemetry Grid */}
                    <div className="pt-1 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[9px] sm:text-[10px] font-mono text-gray-400">
                        <span className="border-l-2 border-white pl-2 text-white font-medium">
                            PREVENTIVE MAINTENANCE
                        </span>
                        <span className="border-l-2 border-white/40 pl-2">
                            CORRECTIVE MAINTENANCE
                        </span>
                        <span className="border-l-2 border-white/40 pl-2">
                            WORK ORDER CONTROL
                        </span>
                    </div>
                </div>
            </div>

            {/* ─── BOTTOM FOOTER TELEMETRY ─── */}
            <footer className={`flex items-center justify-between text-[10px] font-mono text-gray-400 transition-all duration-1000 ${
                phase === 'init' ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
            }`}>
                <div className="flex items-center gap-2">
                    <span className="text-white font-bold">SYS_ID:</span>
                    <span className="text-gray-400">PLANT_MAIN_v2026.09</span>
                </div>
                <div className="hidden sm:block text-gray-400 tracking-wider">
                    AUTHORIZED PERSONNEL ONLY • ALL CONNECTIONS ENCRYPTED
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                    <span className="text-white">NODE: ONLINE</span>
                </div>
            </footer>
        </div>
    );
}
