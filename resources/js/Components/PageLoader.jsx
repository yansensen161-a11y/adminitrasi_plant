import { useEffect, useState } from "react";
import { router } from "@inertiajs/react";

export default function PageLoader() {
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let progressInterval;

        const startLoading = () => {
            setLoading(true);
            setProgress(0);
            progressInterval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 85) { clearInterval(progressInterval); return 85; }
                    return prev + Math.random() * 12;
                });
            }, 120);
        };

        const stopLoading = () => {
            clearInterval(progressInterval);
            setProgress(100);
            setTimeout(() => {
                setLoading(false);
                setProgress(0);
            }, 400);
        };

        const unsubStart  = router.on("start",  startLoading);
        const unsubFinish = router.on("finish", stopLoading);
        const unsubError  = router.on("error",  stopLoading);
        const unsubCancel = router.on("cancel", stopLoading);

        return () => { 
            unsubStart(); 
            unsubFinish(); 
            unsubError();
            unsubCancel();
            clearInterval(progressInterval); 
        };
    }, []);

    if (!loading) return null;

    return (
        <>
            {/* Top progress bar */}
            <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px]">
                <div
                    className="h-full transition-all duration-300 ease-out"
                    style={{
                        width: progress + "%",
                        background: "linear-gradient(90deg, #94a3b8, #ffffff, #f1f5f9, #ffffff, #94a3b8)",
                        backgroundSize: "200% 100%",
                        boxShadow: "0 0 14px 2px rgba(255,255,255,0.9), 0 0 6px rgba(255,255,255,0.7)",
                        animation: "shimmer 1.5s linear infinite",
                    }}
                />
            </div>

            {/* Overlay */}
            <div
                className="fixed inset-0 z-[9998] flex flex-col items-center justify-center"
                style={{ background: "rgba(5, 5, 8, 0.92)", backdropFilter: "blur(12px)" }}
            >
                <div className="relative flex flex-col items-center justify-center">
                    
                    {/* 3D Core Container */}
                    <div 
                        className="relative w-56 h-56 flex items-center justify-center perspective-[1000px]"
                    >
                        {/* Inner 3D Grid Sphere */}
                        <div className="absolute w-24 h-24 rounded-full border-[1px] border-white/20 animate-[spin_10s_linear_infinite]" style={{ transformStyle: 'preserve-3d' }}>
                             <div className="absolute inset-0 rounded-full border-[1px] border-white/20" style={{ transform: 'rotateX(45deg) rotateY(45deg)' }} />
                             <div className="absolute inset-0 rounded-full border-[1px] border-white/20" style={{ transform: 'rotateX(-45deg) rotateY(-45deg)' }} />
                             <div className="absolute inset-0 rounded-full border-[1px] border-white/20" style={{ transform: 'rotateX(90deg)' }} />
                        </div>

                        {/* 3D Rings Gyroscope */}
                        <div className="absolute inset-0 preserve-3d">
                            {/* Ring 1 */}
                            <div className="absolute inset-0 rounded-full border-[3px] border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.3)_inset] border-t-white border-b-white animate-[spin-ring-1_3s_linear_infinite]" style={{ transformStyle: 'preserve-3d' }} />
                            {/* Ring 2 */}
                            <div className="absolute inset-4 rounded-full border-[4px] border-slate-300/20 shadow-[0_0_25px_rgba(255,255,255,0.3)_inset] border-t-slate-200 border-b-slate-200 animate-[spin-ring-2_4.5s_linear_infinite]" style={{ transformStyle: 'preserve-3d' }} />
                            {/* Ring 3 */}
                            <div className="absolute inset-8 rounded-full border-[5px] border-slate-400/20 shadow-[0_0_30px_rgba(255,255,255,0.3)_inset] border-t-white border-b-white animate-[spin-ring-3_6s_linear_infinite]" style={{ transformStyle: 'preserve-3d' }} />
                        </div>
                        
                        {/* Core Glowing Sphere */}
                        <div className="absolute w-12 h-12 rounded-full bg-white shadow-[0_0_50px_20px_rgba(255,255,255,0.95)] animate-pulse" />
                    </div>

                    {/* Progress Info Box */}
                    <div className="mt-16 flex flex-col items-center bg-white/[0.04] px-12 py-6 rounded-3xl border border-white/25 shadow-[0_0_50px_rgba(255,255,255,0.12)] backdrop-blur-2xl relative overflow-hidden">
                        
                        {/* Background light sweep */}
                        <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[sweep_2.5s_linear_infinite]" style={{ transform: 'skewX(-20deg)' }} />

                        <div className="flex items-center gap-3 mb-2 relative z-10">
                            <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#ffffff] animate-ping" />
                            <span className="text-slate-200 font-bold text-sm tracking-[0.3em] uppercase drop-shadow-md">
                                Initializing Core
                            </span>
                        </div>
                        
                        <div className="text-white font-black text-5xl tracking-widest drop-shadow-[0_0_20px_rgba(255,255,255,0.9)] relative z-10" style={{ fontVariantNumeric: "tabular-nums" }}>
                            {Math.round(progress)}<span className="text-2xl text-slate-300 ml-2">%</span>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .perspective-\\[1000px\\] {
                    perspective: 1000px;
                }
                .preserve-3d {
                    transform-style: preserve-3d;
                }
                @keyframes spin-ring-1 {
                    0% { transform: rotateX(65deg) rotateY(0deg) rotateZ(0deg); }
                    100% { transform: rotateX(65deg) rotateY(360deg) rotateZ(360deg); }
                }
                @keyframes spin-ring-2 {
                    0% { transform: rotateX(115deg) rotateY(45deg) rotateZ(0deg); }
                    100% { transform: rotateX(115deg) rotateY(405deg) rotateZ(360deg); }
                }
                @keyframes spin-ring-3 {
                    0% { transform: rotateX(25deg) rotateY(120deg) rotateZ(0deg); }
                    100% { transform: rotateX(25deg) rotateY(480deg) rotateZ(360deg); }
                }
                @keyframes shimmer {
                    0%   { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
                @keyframes sweep {
                    0% { transform: translateX(-100%) skewX(-20deg); }
                    100% { transform: translateX(100%) skewX(-20deg); }
                }
            `}</style>
        </>
    );
}