import React, { Component, useEffect, useRef } from 'react';
import LoginFormPanel from './LoginFormPanel';
import EngineCoreHUD from './EngineCoreHUD';

// 2D Canvas Fallback for ambient cyber particle grid
function CyberCanvasBackground() {
    const canvasRef = useRef();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const handleResize = () => {
            if (!canvas) return;
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);

        // 80 glowing 2D particles
        const particles = Array.from({ length: 80 }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 2 + 1,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            alpha: Math.random() * 0.6 + 0.2,
        }));

        const render = () => {
            ctx.fillStyle = '#030305';
            ctx.fillRect(0, 0, width, height);

            // Radial white aura
            const gradient = ctx.createRadialGradient(
                width * 0.4,
                height * 0.5,
                50,
                width * 0.4,
                height * 0.5,
                width * 0.5
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
            gradient.addColorStop(0.5, 'rgba(200, 210, 230, 0.05)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // Subtle cyber grid lines
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
            ctx.lineWidth = 1;
            const gridSize = 60;
            for (let x = 0; x < width; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();
            }
            for (let y = 0; y < height; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }

            // Draw floating particles
            particles.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
                ctx.shadowColor = '#ffffff';
                ctx.shadowBlur = 8;
                ctx.fill();
            });

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

export class EngineCoreErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.warn('WebGL EngineCore encountered an error, activating fallback:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <EngineCoreFallback {...this.props} />;
        }
        return this.props.children;
    }
}

export default function EngineCoreFallback({ status, canResetPassword }) {
    return (
        <div className="relative min-h-screen w-full bg-[#030305] text-white flex flex-col justify-between overflow-hidden">
            <CyberCanvasBackground />
            <EngineCoreHUD phase="ready" onInitComplete={() => {}} reducedMotion={true} />

            <div className="relative z-30 flex-1 flex items-center justify-end px-6 md:px-16 py-12 max-w-7xl mx-auto w-full">
                <LoginFormPanel
                    status={status}
                    canResetPassword={canResetPassword}
                    phase="ready"
                    onAuthSuccess={() => {
                        window.location.href = route('dashboard');
                    }}
                />
            </div>
        </div>
    );
}
