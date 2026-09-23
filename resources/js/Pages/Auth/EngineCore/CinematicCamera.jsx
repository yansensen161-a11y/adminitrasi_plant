import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

export default function CinematicCamera({ phase = 'init', isWarping = false, reducedMotion = false }) {
    const { camera } = useThree();
    const targetRef = useRef({
        x: 0,
        y: 0,
        z: reducedMotion ? 8.5 : 18.0,
        fov: 50,
        roll: 0,
    });

    useEffect(() => {
        if (reducedMotion) {
            targetRef.current.z = 8.5;
            camera.position.set(0, 0, 8.5);
            return;
        }

        if (phase === 'init') {
            gsap.to(targetRef.current, {
                z: 17.0,
                duration: 2.0,
                ease: 'power1.out',
            });
        } else if (phase === 'formation') {
            gsap.to(targetRef.current, {
                z: 11.0,
                duration: 2.5,
                ease: 'power2.inOut',
            });
        } else if (phase === 'active' || phase === 'ready') {
            gsap.to(targetRef.current, {
                z: 8.5,
                duration: 2.0,
                ease: 'power2.out',
            });
        }
    }, [phase, reducedMotion, camera]);

    useEffect(() => {
        if (isWarping) {
            // Camera warp plunge through the portal center
            gsap.to(targetRef.current, {
                z: -3.5,
                fov: 85,
                roll: Math.PI * 0.4,
                duration: 1.2,
                ease: 'power3.in',
                onUpdate: () => {
                    camera.fov = targetRef.current.fov;
                    camera.updateProjectionMatrix();
                },
            });
        }
    }, [isWarping, camera]);

    useFrame((state) => {
        if (isWarping) {
            camera.position.z = targetRef.current.z;
            camera.position.x = THREE.MathUtils.lerp(camera.position.x, 0, 0.1);
            camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0, 0.1);
            camera.rotation.z = targetRef.current.roll;
            return;
        }

        // Mouse parallax
        const mouseX = (state.pointer.x * (reducedMotion ? 0.05 : 0.6));
        const mouseY = (state.pointer.y * (reducedMotion ? 0.05 : 0.4));

        const targetX = mouseX;
        const targetY = mouseY;
        const targetZ = targetRef.current.z;

        // Smooth interpolation
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.05);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.05);
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.05);

        // Subtle breathing tilt
        const time = state.clock.getElapsedTime();
        const tiltX = -mouseY * 0.08 + Math.sin(time * 0.8) * 0.015;
        const tiltY = mouseX * 0.08 + Math.cos(time * 0.6) * 0.015;

        camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, tiltX, 0.05);
        camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, tiltY, 0.05);
        camera.lookAt(0, 0, 0);
    });

    return null;
}
