import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function FloatingParticles({ count = 1200, isWarping = false, phase = 'init' }) {
    const pointsRef = useRef();

    // Generate initial particle cloud in cylindrical/spherical volume
    const [positions, initialPositions, speeds] = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const initPos = new Float32Array(count * 3);
        const spd = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const radius = 1.0 + Math.random() * 14;
            const theta = Math.random() * Math.PI * 2;
            const z = (Math.random() - 0.5) * 30;

            const x = Math.cos(theta) * radius;
            const y = Math.sin(theta) * radius;

            pos[i * 3] = x;
            pos[i * 3 + 1] = y;
            pos[i * 3 + 2] = z;

            initPos[i * 3] = x;
            initPos[i * 3 + 1] = y;
            initPos[i * 3 + 2] = z;

            // Drift velocity
            spd[i * 3] = (Math.random() - 0.5) * 0.015;     // vx
            spd[i * 3 + 1] = (Math.random() - 0.5) * 0.015; // vy
            spd[i * 3 + 2] = 0.02 + Math.random() * 0.04;   // vz (drifting towards camera)
        }

        return [pos, initPos, spd];
    }, [count]);

    useFrame((state) => {
        if (!pointsRef.current) return;

        const posAttr = pointsRef.current.geometry.attributes.position;
        const array = posAttr.array;

        for (let i = 0; i < count; i++) {
            const idx = i * 3;

            if (isWarping) {
                // Hyper-speed inward suction towards center singularity (0, 0, -2)
                array[idx] += (0 - array[idx]) * 0.08;
                array[idx + 1] += (0 - array[idx + 1]) * 0.08;
                array[idx + 2] -= 0.6; // rush through portal

                if (array[idx + 2] < -15) {
                    array[idx + 2] = 12;
                    const r = 4 + Math.random() * 8;
                    const th = Math.random() * Math.PI * 2;
                    array[idx] = Math.cos(th) * r;
                    array[idx + 1] = Math.sin(th) * r;
                }
            } else {
                // Gentle forward drifting with subtle spiral motion
                array[idx] += speeds[idx];
                array[idx + 1] += speeds[idx + 1];
                array[idx + 2] += speeds[idx + 2];

                // Wrap around z bounds
                if (array[idx + 2] > 15) {
                    array[idx + 2] = -15;
                }

                // Swirl gently
                const x = array[idx];
                const y = array[idx + 1];
                array[idx] = x * Math.cos(0.001) - y * Math.sin(0.001);
                array[idx + 1] = x * Math.sin(0.001) + y * Math.cos(0.001);
            }
        }

        posAttr.needsUpdate = true;
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.055}
                color="#ffffff"
                transparent
                opacity={phase === 'init' ? 0.35 : 0.85}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                sizeAttenuation
            />
        </points>
    );
}
