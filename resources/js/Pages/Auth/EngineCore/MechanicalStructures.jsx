import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function MechanicalStructures({ isWarping = false, reducedMotion = false }) {
    const groupRef = useRef();
    const coreRef = useRef();
    const innerCageRef = useRef();
    const outerChassisRef = useRef();
    const laserRingRef = useRef();
    const laserRing2Ref = useRef();

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        const speedMultiplier = isWarping ? 8 : (reducedMotion ? 0.1 : 1);

        // Core plasma pulse
        if (coreRef.current) {
            const pulse = 1 + Math.sin(time * 3 * speedMultiplier) * 0.12;
            coreRef.current.scale.set(pulse, pulse, pulse);
        }

        // Inner geometric core rotation
        if (innerCageRef.current) {
            innerCageRef.current.rotation.x = time * 0.4 * speedMultiplier;
            innerCageRef.current.rotation.y = time * 0.6 * speedMultiplier;
            innerCageRef.current.rotation.z = time * 0.2 * speedMultiplier;
        }

        // Outer chassis slow counter-rotation
        if (outerChassisRef.current) {
            outerChassisRef.current.rotation.z = -time * 0.08 * speedMultiplier;
        }

        // Laser alignment ring pulses
        if (laserRingRef.current) {
            laserRingRef.current.rotation.z = time * 0.15 * speedMultiplier;
            laserRingRef.current.material.opacity = 0.5 + Math.sin(time * 4) * 0.25;
        }

        if (laserRing2Ref.current) {
            laserRing2Ref.current.rotation.z = -time * 0.25 * speedMultiplier;
            laserRing2Ref.current.material.opacity = 0.6 + Math.cos(time * 3.5) * 0.25;
        }

        // Scale down structures rapidly during warp collapse
        if (isWarping && groupRef.current) {
            const currentScale = groupRef.current.scale.x;
            const targetScale = Math.max(0.01, currentScale - 0.03);
            groupRef.current.scale.set(targetScale, targetScale, targetScale);
        }
    });

    return (
        <group ref={groupRef} position={[0, 0, 0]}>
            {/* ─── CENTRAL REACTOR CORE ─── */}
            <group>
                {/* Glowing White Plasma Sphere */}
                <mesh ref={coreRef}>
                    <sphereGeometry args={[1.1, 32, 32]} />
                    <meshBasicMaterial
                        color="#ffffff"
                        transparent
                        opacity={0.9}
                        blending={THREE.AdditiveBlending}
                    />
                </mesh>

                {/* Concentric Geometric Cage */}
                <mesh ref={innerCageRef}>
                    <icosahedronGeometry args={[1.5, 0]} />
                    <meshStandardMaterial
                        color="#0f172a"
                        wireframe
                        wireframeLinewidth={2}
                        emissive="#ffffff"
                        emissiveIntensity={0.5}
                        roughness={0.2}
                        metalness={0.9}
                    />
                </mesh>

                {/* Secondary Wireframe Ring */}
                <mesh rotation={[Math.PI / 3, 0, 0]}>
                    <torusGeometry args={[2.0, 0.03, 16, 64]} />
                    <meshStandardMaterial
                        color="#1e293b"
                        emissive="#cbd5e1"
                        emissiveIntensity={0.6}
                        metalness={0.9}
                    />
                </mesh>
            </group>

            {/* ─── MECHANICAL PORTAL CHASSIS ─── */}
            <group ref={outerChassisRef}>
                {/* Heavy Outer Segmented Torus */}
                <mesh>
                    <torusGeometry args={[6.4, 0.09, 16, 128]} />
                    <meshStandardMaterial
                        color="#1e293b"
                        metalness={0.95}
                        roughness={0.25}
                    />
                </mesh>

                {/* Middle Support Ring */}
                <mesh position={[0, 0, -0.4]}>
                    <torusGeometry args={[6.1, 0.05, 12, 96]} />
                    <meshStandardMaterial
                        color="#0f172a"
                        emissive="#64748b"
                        emissiveIntensity={0.3}
                        metalness={0.9}
                    />
                </mesh>

                {/* 4 Heavy Hydraulic Mechanical Clamps at 45 degree diagonals */}
                {[Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4].map((rad, idx) => (
                    <group key={idx} rotation={[0, 0, rad]}>
                        <mesh position={[6.35, 0, 0]}>
                            <boxGeometry args={[0.7, 0.28, 0.4]} />
                            <meshStandardMaterial
                                color="#334155"
                                metalness={0.9}
                                roughness={0.3}
                            />
                        </mesh>
                        <mesh position={[6.6, 0, 0]}>
                            <boxGeometry args={[0.2, 0.08, 0.42]} />
                            <meshBasicMaterial color="#ffffff" />
                        </mesh>
                    </group>
                ))}
            </group>

            {/* ─── HIGH-ENERGY LASER ALIGNMENT RINGS ─── */}
            <mesh ref={laserRingRef} position={[0, 0, -0.1]}>
                <torusGeometry args={[2.85, 0.015, 16, 128]} />
                <meshBasicMaterial
                    color="#ffffff"
                    transparent
                    opacity={0.8}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            <mesh ref={laserRing2Ref} position={[0, 0, 0.1]}>
                <torusGeometry args={[6.7, 0.02, 16, 128]} />
                <meshBasicMaterial
                    color="#ffffff"
                    transparent
                    opacity={0.65}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
        </group>
    );
}
