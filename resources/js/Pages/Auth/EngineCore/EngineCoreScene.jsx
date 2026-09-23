import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import PortalCubes from './PortalCubes';
import MechanicalStructures from './MechanicalStructures';
import FloatingParticles from './FloatingParticles';
import CinematicCamera from './CinematicCamera';

function PulsingLights({ isWarping = false }) {
    const centerLightRef = useRef();
    const rim1Ref = useRef();
    const rim2Ref = useRef();

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        const pulse = 1 + Math.sin(time * 2.5) * 0.3;
        
        if (centerLightRef.current) {
            centerLightRef.current.intensity = isWarping ? 35 : 8 * pulse;
        }
        if (rim1Ref.current) {
            rim1Ref.current.intensity = isWarping ? 15 : 4 + Math.sin(time * 3) * 1.5;
        }
        if (rim2Ref.current) {
            rim2Ref.current.intensity = isWarping ? 15 : 4 + Math.cos(time * 3) * 1.5;
        }
    });

    return (
        <>
            {/* Ambient Base Light */}
            <ambientLight intensity={0.4} color="#0f172a" />

            {/* Pulsing Core Point Light */}
            <pointLight
                ref={centerLightRef}
                position={[0, 0, 1.2]}
                color="#ffffff"
                distance={18}
                decay={2}
            />

            {/* Left Rim Light */}
            <pointLight
                ref={rim1Ref}
                position={[-8, 4, 3]}
                color="#e2e8f0"
                distance={24}
                decay={2}
            />

            {/* Right Rim Light */}
            <pointLight
                ref={rim2Ref}
                position={[8, -4, 3]}
                color="#f8fafc"
                distance={24}
                decay={2}
            />

            {/* Deep Back Rim for Metallic Edge Contours */}
            <pointLight
                position={[0, 0, -4]}
                color="#ffffff"
                intensity={3.5}
                distance={15}
            />
        </>
    );
}

export default function EngineCoreScene({ phase = 'init', isWarping = false, reducedMotion = false }) {
    return (
        <div className="absolute inset-0 w-full h-full pointer-events-auto">
            <Canvas
                gl={{
                    antialias: true,
                    alpha: false,
                    powerPreference: 'high-performance',
                }}
                dpr={[1, 2]}
                camera={{ position: [0, 0, reducedMotion ? 8.5 : 18], fov: 50 }}
            >
                <color attach="background" args={['#030305']} />
                
                <PulsingLights isWarping={isWarping} />

                <CinematicCamera
                    phase={phase}
                    isWarping={isWarping}
                    reducedMotion={reducedMotion}
                />

                <PortalCubes
                    phase={phase}
                    isWarping={isWarping}
                    reducedMotion={reducedMotion}
                />

                <MechanicalStructures
                    isWarping={isWarping}
                    reducedMotion={reducedMotion}
                />

                <FloatingParticles
                    phase={phase}
                    isWarping={isWarping}
                    count={reducedMotion ? 300 : 1200}
                />
            </Canvas>
        </div>
    );
}
