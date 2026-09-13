import { Head, Link, useForm } from '@inertiajs/react';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float, Sparkles, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Komponen 3D Utama: Inti Energi Berputar
function AnimatedCore() {
    const coreRef = useRef();
    const groupRef = useRef();

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        // Animasi rotasi keseluruhan
        groupRef.current.rotation.y = time * 0.1;
        groupRef.current.rotation.z = time * 0.05;
        
        // Reaksi parallax terhadap mouse
        const targetX = (state.mouse.x * Math.PI) / 10;
        const targetY = (state.mouse.y * Math.PI) / -10;
        
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetY, 0.05);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetX + time * 0.1, 0.05);
        
        // Efek pernapasan/denyut
        coreRef.current.scale.setScalar(1 + Math.sin(time * 2) * 0.05);
    });

    return (
        <group ref={groupRef} position={[2, 0, -5]}>
            {/* Inti Abstrak */}
            <Float speed={2} rotationIntensity={2} floatIntensity={2}>
                <mesh ref={coreRef}>
                    <icosahedronGeometry args={[2.5, 4]} />
                    <MeshDistortMaterial 
                        color="#25C978" 
                        emissive="#0e7a3d"
                        emissiveIntensity={2}
                        wireframe 
                        distort={0.4} 
                        speed={2} 
                        roughness={0} 
                        transparent 
                        opacity={0.8}
                    />
                </mesh>
            </Float>

            {/* Cincin Orbital 1 */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[3.5, 0.02, 16, 100]} />
                <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} />
            </mesh>
            
            {/* Cincin Orbital 2 */}
            <mesh rotation={[Math.PI / 3, Math.PI / 4, 0]}>
                <torusGeometry args={[4.5, 0.01, 16, 100]} />
                <meshBasicMaterial color="#25C978" transparent opacity={0.3} />
            </mesh>
        </group>
    );
}

function Scene() {
    return (
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
            <color attach="background" args={['#030712']} />
            <ambientLight intensity={0.2} />
            
            {/* Efek Bintang dan Galaksi */}
            <Stars radius={100} depth={50} count={7000} factor={4} saturation={1} fade speed={2} />
            <Sparkles count={500} scale={20} size={1.5} speed={0.5} opacity={0.6} color="#38bdf8" />
            <Sparkles count={500} scale={25} size={2} speed={0.8} opacity={0.5} color="#25C978" />

            <AnimatedCore />
        </Canvas>
    );
}

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { 
            opacity: 1, 
            scale: 1,
            transition: { type: 'spring', damping: 25, staggerChildren: 0.1, delayChildren: 0.2 } 
        }
    };
    
    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 15 } }
    };

    return (
        <>
            <Head title="Login | Plant Maintenance System" />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@400;700;900&display=swap');
                
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                html, body, #app { height: 100%; width: 100%; background: #030712; }
                
                .app-container {
                    height: 100vh;
                    width: 100%;
                    font-family: 'Inter', sans-serif;
                    position: relative;
                    overflow: hidden;
                }

                .canvas-container {
                    position: absolute;
                    inset: 0;
                    z-index: 0;
                }

                /* Gradient radial halus untuk kedalaman tambahan */
                .shadow-overlay {
                    position: absolute;
                    inset: 0;
                    background: radial-gradient(circle at 30% 50%, transparent 20%, rgba(3, 7, 18, 0.8) 100%);
                    z-index: 5;
                    pointer-events: none;
                }

                .content-layer {
                    position: relative;
                    z-index: 10;
                    height: 100%;
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: flex-start;
                    padding: 0 8%;
                }

                .login-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 60px;
                    width: 100%;
                }

                /* Navbar */
                .navbar {
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    height: 90px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 5%;
                    z-index: 20;
                }
                
                .nav-logo {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                }
                .nav-logo-icon {
                    width: 48px; height: 48px;
                    background: linear-gradient(135deg, #18A957, #0e7a3d);
                    border-radius: 14px;
                    display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 0 25px rgba(24,169,87,0.4);
                }
                .nav-logo-icon svg { width: 26px; height: 26px; color: #fff; }
                .nav-logo-text { display: flex; flex-direction: column; line-height: 1.1; }
                .nav-logo-text b { font-family: 'Outfit', sans-serif; font-size: 20px; font-weight: 900; color: #fff; letter-spacing: 0.05em; }
                .nav-logo-text span { font-size: 11px; font-weight: 700; color: #25C978; letter-spacing: 0.3em; margin-top: 2px; }

                /* Premium Dark Glass Panel */
                .glass-panel {
                    width: 100%;
                    max-width: 580px;
                    flex-shrink: 0;
                    background: rgba(17, 24, 39, 0.45);
                    backdrop-filter: blur(24px);
                    -webkit-backdrop-filter: blur(24px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 28px;
                    padding: 60px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.03) inset;
                    position: relative;
                    overflow: hidden;
                }
                
                .glass-panel::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    height: 2px;
                    background: linear-gradient(90deg, transparent, #25C978, transparent);
                    opacity: 0.8;
                }

                .badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(37,201,120,0.1);
                    border: 1px solid rgba(37,201,120,0.2);
                    border-radius: 30px;
                    padding: 6px 14px;
                    font-size: 11px;
                    font-weight: 700;
                    color: #25C978;
                    letter-spacing: 0.1em;
                    margin-bottom: 32px;
                    text-transform: uppercase;
                }
                
                .title-block { margin-bottom: 40px; }
                .title-welcome { font-size: 15px; font-weight: 500; color: rgba(255,255,255,0.6); margin-bottom: 6px; display: block; }
                .title-main { font-family: 'Outfit', sans-serif; font-size: 42px; font-weight: 900; color: #fff; line-height: 1.1; letter-spacing: -0.02em; }
                .title-main span { color: #25C978; }
                
                /* Input Fields */
                .input-group { margin-bottom: 24px; }
                .input-label-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
                .input-label { font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.7); }
                .forgot-link { font-size: 12px; font-weight: 500; color: #38bdf8; text-decoration: none; transition: color 0.2s; }
                .forgot-link:hover { color: #7dd3fc; }
                
                .input-wrapper {
                    display: flex;
                    align-items: center;
                    background: rgba(0, 0, 0, 0.3);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    transition: all 0.3s ease;
                }
                .input-wrapper:focus-within {
                    border-color: #25C978;
                    background: rgba(37, 201, 120, 0.05);
                    box-shadow: 0 0 0 4px rgba(37, 201, 120, 0.1);
                }
                
                .input-icon {
                    width: 50px;
                    display: flex; align-items: center; justify-content: center;
                    color: rgba(255,255,255,0.4);
                }
                .input-field {
                    flex: 1;
                    padding: 16px 16px 16px 0;
                    background: transparent;
                    border: none;
                    outline: none;
                    color: #fff;
                    font-size: 15px;
                    font-weight: 400;
                    font-family: inherit;
                }
                .input-field::placeholder { color: rgba(255,255,255,0.2); }
                
                .eye-btn {
                    width: 50px; height: 100%;
                    background: none; border: none;
                    display: flex; align-items: center; justify-content: center;
                    color: rgba(255,255,255,0.4);
                    cursor: pointer;
                    transition: color 0.2s;
                }
                .eye-btn:hover { color: #fff; }
                
                /* Checkbox */
                .checkbox-wrapper { display: flex; align-items: center; gap: 12px; margin-bottom: 32px; cursor: pointer; }
                .custom-checkbox {
                    width: 20px; height: 20px;
                    border: 2px solid rgba(255,255,255,0.2);
                    border-radius: 6px;
                    display: flex; align-items: center; justify-content: center;
                    transition: all 0.2s;
                }
                input[type="checkbox"]:checked + .custom-checkbox {
                    background: #25C978; border-color: #25C978;
                }
                .checkbox-label { font-size: 13.5px; color: rgba(255,255,255,0.7); font-weight: 400; user-select: none; }
                
                /* Submit Button */
                .submit-btn {
                    width: 100%;
                    padding: 16px;
                    background: #25C978;
                    color: #030712;
                    border: none;
                    border-radius: 12px;
                    font-size: 15px;
                    font-weight: 700;
                    font-family: 'Outfit', sans-serif;
                    cursor: pointer;
                    display: flex; align-items: center; justify-content: center; gap: 10px;
                    transition: all 0.3s ease;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .submit-btn:hover {
                    background: #2ced8d;
                    box-shadow: 0 10px 20px rgba(37,201,120,0.2);
                    transform: translateY(-2px);
                }
                .submit-btn:active { transform: translateY(0); }
                .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
            `}</style>

            <div className="app-container">
                {/* 3D Animated Background Layer */}
                <div className="canvas-container">
                    <Scene />
                </div>
                
                <div className="shadow-overlay"></div>

                <nav className="navbar">
                    <div className="nav-logo">
                        <div className="nav-logo-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                            </svg>
                        </div>
                        <div className="nav-logo-text">
                            <b>PLANT</b>
                            <span>MAINTENANCE</span>
                        </div>
                    </div>
                </nav>

                <div className="content-layer">
                    <div className="login-wrapper">
                        <AnimatePresence>
                            {mounted && (
                                <motion.div 
                                    className="glass-panel"
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    <motion.div variants={itemVariants} className="badge">
                                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                                        SECURE PORTAL
                                    </motion.div>

                                    <motion.div variants={itemVariants} className="title-block">
                                        <span className="title-welcome">Welcome back,</span>
                                        <h2 className="title-main">PLANT <span>SYSTEM</span></h2>
                                    </motion.div>

                                    {status && (
                                        <motion.div variants={itemVariants} className="mb-4 text-sm font-medium text-green-400 bg-green-400/10 p-3 rounded-lg border border-green-400/20">
                                            {status}
                                        </motion.div>
                                    )}

                                    <form onSubmit={submit}>
                                        <motion.div variants={itemVariants} className="input-group">
                                            <div className="input-label-row">
                                                <label className="input-label">Email Address</label>
                                            </div>
                                            <div className="input-wrapper">
                                                <div className="input-icon">
                                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                                                </div>
                                                <input 
                                                    type="email" 
                                                    className="input-field" 
                                                    value={data.email} 
                                                    onChange={e => setData('email', e.target.value)} 
                                                    required 
                                                    autoFocus 
                                                    placeholder="Enter your email" 
                                                />
                                            </div>
                                            {errors.email && <div className="text-red-400 text-sm mt-2 font-medium">{errors.email}</div>}
                                        </motion.div>

                                        <motion.div variants={itemVariants} className="input-group">
                                            <div className="input-label-row">
                                                <label className="input-label">Password</label>
                                                {canResetPassword && <Link href={route('password.request')} className="forgot-link">Forgot Password?</Link>}
                                            </div>
                                            <div className="input-wrapper">
                                                <div className="input-icon">
                                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                                                </div>
                                                <input 
                                                    type={showPassword ? 'text' : 'password'} 
                                                    className="input-field" 
                                                    value={data.password} 
                                                    onChange={e => setData('password', e.target.value)} 
                                                    required 
                                                    placeholder="Enter your password" 
                                                />
                                                <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                                                    {showPassword ? 
                                                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> : 
                                                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                                    }
                                                </button>
                                            </div>
                                            {errors.password && <div className="text-red-400 text-sm mt-2 font-medium">{errors.password}</div>}
                                        </motion.div>

                                        <motion.label variants={itemVariants} className="checkbox-wrapper">
                                            <input 
                                                type="checkbox" 
                                                className="hidden" 
                                                checked={data.remember} 
                                                onChange={e => setData('remember', e.target.checked)} 
                                            />
                                            <div className="custom-checkbox">
                                                {data.remember && <svg width="14" height="14" fill="none" stroke="#030712" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                                            </div>
                                            <span className="checkbox-label">Remember this device</span>
                                        </motion.label>

                                        <motion.button 
                                            variants={itemVariants} 
                                            type="submit" 
                                            className="submit-btn" 
                                            disabled={processing}
                                        >
                                            Sign In
                                            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                                        </motion.button>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </>
    );
}
