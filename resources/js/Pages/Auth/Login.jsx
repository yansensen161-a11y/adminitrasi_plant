import React, { useState, useEffect, useCallback } from 'react';
import { Head } from '@inertiajs/react';
import EngineCoreScene from './EngineCore/EngineCoreScene';
import EngineCoreHUD from './EngineCore/EngineCoreHUD';
import LoginFormPanel from './EngineCore/LoginFormPanel';
import EngineCoreFallback, { EngineCoreErrorBoundary } from './EngineCore/EngineCoreFallback';

export default function Login({ status, canResetPassword, initialMode = 'login' }) {
    const [phase, setPhase] = useState('init'); // 'init' | 'formation' | 'active' | 'ready' | 'warp'
    const [webglSupported, setWebglSupported] = useState(true);
    const [reducedMotion, setReducedMotion] = useState(false);

    // Check WebGL availability & reduced-motion preference on mount
    useEffect(() => {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (!gl) {
                setWebglSupported(false);
            }
        } catch (e) {
            setWebglSupported(false);
        }

        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (mediaQuery.matches) {
            setReducedMotion(true);
            setPhase('ready');
        }

        const handleChange = (e) => {
            setReducedMotion(e.matches);
            if (e.matches) setPhase('ready');
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // 01 — SYSTEM INITIALIZATION complete callback -> trigger 02 Formation
    const handleInitComplete = useCallback(() => {
        setPhase('formation');

        // 03 — CINEMATIC CAMERA & 04 — LOGIN REVEAL timeline
        setTimeout(() => {
            setPhase('active');
        }, 1400);

        setTimeout(() => {
            setPhase('ready');
        }, 2200);
    }, []);

    // If WebGL is not available, render resilient 2D fallback immediately
    if (!webglSupported) {
        return (
            <EngineCoreFallback
                status={status}
                canResetPassword={canResetPassword}
            />
        );
    }

    return (
        <EngineCoreErrorBoundary status={status} canResetPassword={canResetPassword}>
            <Head>
                <title>ENGINE CORE — Plant Maintenance Management System</title>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700;800&family=Orbitron:wght@500;700;900&family=Rajdhani:wght@500;600;700&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <style>{`
                /* Futuristic Cyberpunk Design System for ENGINE CORE */
                .engine-core-root {
                    font-family: 'Rajdhani', -apple-system, BlinkMacSystemFont, sans-serif;
                    background-color: #030305;
                    color: #f3f4f6;
                    position: relative;
                    width: 100vw;
                    height: 100vh;
                    height: 100svh;
                    overflow: hidden;
                    user-select: none;
                }

                .engine-core-root h1,
                .engine-core-root h2,
                .engine-core-root .font-orbitron {
                    font-family: 'Orbitron', sans-serif;
                }

                .engine-core-root .font-mono,
                .engine-core-root code,
                .engine-core-root input {
                    font-family: 'JetBrains Mono', monospace;
                }

                /* Custom cyber scrollbar prevention */
                ::-webkit-scrollbar {
                    display: none;
                }

                /* White platinum glow utility */
                .glow-crimson {
                    filter: drop-shadow(0 0 12px rgba(255, 255, 255, 0.45));
                }

                .glow-crimson-heavy {
                    filter: drop-shadow(0 0 28px rgba(255, 255, 255, 0.75));
                }
            `}</style>

            <div className="engine-core-root selection:bg-white/25 selection:text-white">
                {/* ─── 3D WEBGL STAGE (Cubes Portal, Particles, Mechanical Structures) ─── */}
                <EngineCoreScene
                    phase={phase}
                    reducedMotion={reducedMotion}
                />

                {/* ─── 2D HUD OVERLAY (Terminal Boot, Telemetry, Headlines) ─── */}
                <EngineCoreHUD
                    phase={phase}
                    onInitComplete={handleInitComplete}
                    reducedMotion={reducedMotion}
                />

                {/* ─── GLASSMORPHISM LOGIN PANEL CONTAINER (POJOK KANAN) ─── */}
                <div className="relative z-30 flex h-full w-full items-center justify-center lg:justify-end px-6 sm:px-10 lg:px-12 xl:px-16 2xl:px-20 pointer-events-none">
                    <LoginFormPanel
                        status={status}
                        canResetPassword={canResetPassword}
                        phase={phase}
                        initialMode={initialMode}
                    />
                </div>
            </div>
        </EngineCoreErrorBoundary>
    );
}
