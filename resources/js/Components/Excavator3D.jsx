import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Float } from '@react-three/drei';

function ExcavatorPlaceholder(props) {
    const group = useRef();
    const arm1 = useRef();
    const arm2 = useRef();
    const body = useRef();

    // Simple idle & digging animation
    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        // Body subtle rotation
        if (body.current) {
            body.current.rotation.y = Math.sin(t * 0.5) * 0.2;
        }
        if (arm1.current && arm2.current) {
            // Simulate digging motion
            arm1.current.rotation.z = Math.sin(t * 1.5) * 0.2 + 0.3;
            arm2.current.rotation.z = Math.cos(t * 1.5) * 0.3 - 0.5;
        }
    });

    return (
        <group ref={group} {...props} dispose={null}>
            {/* Tracks / Base */}
            <mesh position={[0, -0.4, 0]}>
                <boxGeometry args={[1.8, 0.4, 1.2]} />
                <meshStandardMaterial color="#1e293b" /> {/* Dark Slate */}
            </mesh>

            {/* Upper Body (Rotates) */}
            <group ref={body} position={[0, 0, 0]}>
                {/* Engine/Cabin Base */}
                <mesh position={[-0.2, 0.2, 0]}>
                    <boxGeometry args={[1.4, 0.8, 1.1]} />
                    <meshStandardMaterial color="#facc15" /> {/* Yellow */}
                </mesh>

                {/* Cabin window */}
                <mesh position={[0.2, 0.4, 0.2]}>
                    <boxGeometry args={[0.6, 0.8, 0.6]} />
                    <meshStandardMaterial color="#0f172a" opacity={0.9} transparent />
                </mesh>
                
                {/* Counterweight */}
                <mesh position={[-0.7, 0.2, 0]}>
                    <boxGeometry args={[0.4, 0.8, 1.1]} />
                    <meshStandardMaterial color="#334155" />
                </mesh>

                {/* Arm Base / Boom */}
                <group position={[0.4, 0.2, -0.2]}>
                    {/* The boom joint */}
                    <mesh position={[0.5, 0.6, 0]} rotation={[0, 0, Math.PI / 6]}>
                        <boxGeometry args={[1.5, 0.25, 0.2]} />
                        <meshStandardMaterial color="#facc15" />
                    </mesh>

                    {/* Boom reference for animation */}
                    <group ref={arm1} position={[1.1, 1.0, 0]}>
                        {/* The dipper/stick */}
                        <mesh position={[0.4, -0.5, 0]} rotation={[0, 0, -Math.PI / 2.5]}>
                            <boxGeometry args={[1.2, 0.2, 0.2]} />
                            <meshStandardMaterial color="#facc15" />
                        </mesh>
                        
                        <group ref={arm2} position={[0.8, -1.0, 0]}>
                            {/* Bucket */}
                            <mesh position={[0.1, -0.3, 0]} rotation={[0, 0, Math.PI / 4]}>
                                <cylinderGeometry args={[0.2, 0.1, 0.4, 16]} />
                                <meshStandardMaterial color="#475569" />
                            </mesh>
                        </group>
                    </group>
                </group>
            </group>
        </group>
    );
}

// Catatan: Jika Anda sudah memiliki file excavator.glb, Anda bisa menggunakan `useGLTF` seperti ini:
// import { useGLTF } from '@react-three/drei';
// function RealExcavatorModel(props) {
//   const { scene } = useGLTF('/excavator.glb');
//   return <primitive object={scene} {...props} />;
// }

export default function Excavator3D({ className = "" }) {
    return (
        <div className={`w-full h-full min-h-[400px] ${className}`}>
            <Canvas camera={{ position: [5, 3, 5], fov: 45 }}>
                <ambientLight intensity={0.6} />
                <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />
                
                <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.2}>
                    <ExcavatorPlaceholder />
                </Float>

                <ContactShadows position={[0, -0.8, 0]} opacity={0.6} scale={15} blur={2} far={4} />
                <Environment preset="city" />
                <OrbitControls 
                    enableZoom={true} 
                    autoRotate 
                    autoRotateSpeed={0.5} 
                    maxPolarAngle={Math.PI / 2 + 0.1} 
                    minPolarAngle={Math.PI / 4}
                />
            </Canvas>
        </div>
    );
}
