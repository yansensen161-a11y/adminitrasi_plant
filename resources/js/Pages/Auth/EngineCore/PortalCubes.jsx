import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

export default function PortalCubes({ phase = 'init', isWarping = false, reducedMotion = false }) {
    const meshRef = useRef();
    const dummy = useMemo(() => new THREE.Object3D(), []);

    // High-performance procedural 3D Cyber Sword geometry
    const swordGeometry = useMemo(() => {
        const shape = new THREE.Shape();
        // Pommel base
        shape.moveTo(0, -0.65);
        shape.lineTo(0.09, -0.55);
        shape.lineTo(0.045, -0.50);
        // Hilt / Handle grip
        shape.lineTo(0.045, 0.20);
        // Cyber Crossguard right wing
        shape.lineTo(0.28, 0.24);
        shape.lineTo(0.28, 0.36);
        shape.lineTo(0.10, 0.40);
        // Double-edged Blade
        shape.lineTo(0.09, 1.55);
        shape.lineTo(0, 2.25); // Razor-sharp tip apex
        shape.lineTo(-0.09, 1.55);
        shape.lineTo(-0.10, 0.40);
        // Cyber Crossguard left wing
        shape.lineTo(-0.28, 0.36);
        shape.lineTo(-0.28, 0.24);
        // Hilt / Handle grip left
        shape.lineTo(-0.045, 0.20);
        shape.lineTo(-0.045, -0.50);
        // Pommel left
        shape.lineTo(-0.09, -0.55);
        shape.closePath();

        const geom = new THREE.ExtrudeGeometry(shape, {
            depth: 0.04,
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: 0.02,
            bevelThickness: 0.02,
        });
        geom.center();
        return geom;
    }, []);

    // Configuration of 5 concentric rings forming the circular blade vortex
    const layers = useMemo(() => [
        { radius: 3.2, count: 56, zOffset: -0.30, speed: 0.28, swordScale: 0.38 },
        { radius: 4.0, count: 72, zOffset: 0.15, speed: -0.22, swordScale: 0.42 },
        { radius: 4.8, count: 88, zOffset: -0.18, speed: 0.18, swordScale: 0.46 },
        { radius: 5.6, count: 104, zOffset: 0.25, speed: -0.15, swordScale: 0.50 },
        { radius: 6.4, count: 120, zOffset: -0.05, speed: 0.12, swordScale: 0.54 },
    ], []);

    const totalSwords = useMemo(() => layers.reduce((sum, l) => sum + l.count, 0), [layers]);

    // Precalculate initial (scattered) and target (portal ring) data for every sword
    const swordData = useMemo(() => {
        const data = [];
        let index = 0;

        layers.forEach((layer, layerIdx) => {
            for (let i = 0; i < layer.count; i++) {
                const angle = (i / layer.count) * Math.PI * 2;
                
                // Exploded starting position in deep space
                const spreadDist = 20 + Math.random() * 25;
                const spreadAngle = angle + (Math.random() - 0.5) * 1.5;
                const startX = Math.cos(spreadAngle) * spreadDist;
                const startY = Math.sin(spreadAngle) * spreadDist;
                const startZ = (Math.random() - 0.5) * 35 - 10;

                // Target position in circular portal ring
                const targetX = Math.cos(angle) * layer.radius;
                const targetY = Math.sin(angle) * layer.radius;
                const targetZ = layer.zOffset + (Math.random() - 0.5) * 0.15;

                data.push({
                    index,
                    layerIdx,
                    angle,
                    baseRadius: layer.radius,
                    speed: layer.speed,
                    swordScale: layer.swordScale,
                    startPos: new THREE.Vector3(startX, startY, startZ),
                    targetPos: new THREE.Vector3(targetX, targetY, targetZ),
                    currentPos: new THREE.Vector3(startX, startY, startZ),
                    rotSpeedX: (Math.random() - 0.5) * 2.0,
                    rotSpeedY: (Math.random() - 0.5) * 2.0,
                    rotSpeedZ: (Math.random() - 0.5) * 2.0,
                    staggerDelay: layerIdx * 0.15 + (i / layer.count) * 0.3,
                });
                index++;
            }
        });

        return data;
    }, [layers]);

    // Animation progress references driven by GSAP
    const animState = useRef({
        formation: reducedMotion ? 1 : 0, // 0 -> 1 during phase 02
        warp: 0,
        pulse: 1,
    });

    useEffect(() => {
        if (reducedMotion) {
            animState.current.formation = 1;
            return;
        }

        if (phase === 'formation' || phase === 'active' || phase === 'ready') {
            gsap.to(animState.current, {
                formation: 1,
                duration: 2.4,
                ease: 'power3.out',
            });
        }
    }, [phase, reducedMotion]);

    useEffect(() => {
        if (isWarping) {
            gsap.to(animState.current, {
                warp: 1,
                duration: 1.2,
                ease: 'power4.in',
            });
        }
    }, [isWarping]);

    useFrame((state) => {
        if (!meshRef.current) return;

        const time = state.clock.getElapsedTime();
        const formationProgress = animState.current.formation;
        const warpProgress = animState.current.warp;

        // In reduced motion, skip fast continuous rotations
        const timeScale = reducedMotion ? 0.05 : 1;

        for (let i = 0; i < totalSwords; i++) {
            const sword = swordData[i];
            
            // Staggered formation curve per sword
            const localProgress = THREE.MathUtils.clamp(
                (formationProgress - sword.staggerDelay * 0.3) / (1 - sword.staggerDelay * 0.3 || 1),
                0,
                1
            );
            const easeProgress = THREE.MathUtils.smoothstep(localProgress, 0, 1);

            // Ring rotation & harmonic breathing
            const currentAngle = sword.angle + time * sword.speed * timeScale;
            const breathing = Math.sin(time * 2 + sword.layerIdx) * 0.05;
            const radius = (sword.baseRadius + breathing) * (1 - warpProgress * 0.95);

            // Compute ideal orbiting portal position
            const orbitX = Math.cos(currentAngle) * radius;
            const orbitY = Math.sin(currentAngle) * radius;
            const orbitZ = sword.targetPos.z + Math.cos(time * 1.5 + sword.layerIdx) * 0.1 - warpProgress * 3.0;

            // Interpolate position from exploded start to orbit position
            dummy.position.x = THREE.MathUtils.lerp(sword.startPos.x, orbitX, easeProgress);
            dummy.position.y = THREE.MathUtils.lerp(sword.startPos.y, orbitY, easeProgress);
            dummy.position.z = THREE.MathUtils.lerp(sword.startPos.z, orbitZ, easeProgress);

            // Calculate tangential motion direction so sword tip points along orbital flight path
            const motionDir = sword.speed > 0 ? currentAngle - Math.PI / 2 : currentAngle + Math.PI / 2;
            const orbitRotZ = motionDir - Math.PI / 2;

            // Orientation: In formation, align blade tangentially with subtle aerodynamic glint tilt
            const tumbleX = time * sword.rotSpeedX * (1 - easeProgress);
            const tumbleY = time * sword.rotSpeedY * (1 - easeProgress);
            const tumbleZ = time * sword.rotSpeedZ * (1 - easeProgress);

            dummy.rotation.x = THREE.MathUtils.lerp(tumbleX, Math.PI / 2 + Math.sin(time * 2 + i * 0.2) * 0.15, easeProgress);
            dummy.rotation.y = THREE.MathUtils.lerp(tumbleY, Math.cos(time * 2 + i * 0.2) * 0.15, easeProgress);
            dummy.rotation.z = THREE.MathUtils.lerp(tumbleZ, orbitRotZ, easeProgress) + (warpProgress * time * 12);

            // Scale swords: grow to full size in portal, shrink at singularity warp
            const baseScale = sword.swordScale * (0.2 + 0.8 * easeProgress);
            const currentScale = baseScale * (1 - warpProgress);
            dummy.scale.set(currentScale, currentScale, currentScale);

            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        }

        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh
            ref={meshRef}
            args={[swordGeometry, null, totalSwords]}
            castShadow
            receiveShadow
        >
            <meshPhysicalMaterial
                color="#ffffff"
                emissive="#334155"
                emissiveIntensity={0.3}
                roughness={0.10}
                metalness={0.98}
                clearcoat={1.0}
                clearcoatRoughness={0.05}
                reflectivity={1.0}
            />
        </instancedMesh>
    );
}
