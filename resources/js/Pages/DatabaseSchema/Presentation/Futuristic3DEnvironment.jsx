import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import * as THREE from 'three';
import { Play, Pause, RotateCcw, Video, Download, Compass, Layers, X } from 'lucide-react';

/**
 * Category Color Palette (Cyberpunk / Futuristic Enterprise)
 */
const CATEGORY_PALETTE = {
    fleet: {
        color: 0x00ff9d, // Neon Emerald
        hex: '#00ff9d',
        label: 'Fleet & Asset',
        clusterX: -360,
        clusterY: 90,
        clusterZ: 0,
    },
    work_order: {
        color: 0x00e5ff, // Cyber Cyan
        hex: '#00e5ff',
        label: 'Work Order Core',
        clusterX: 20,
        clusterY: 110,
        clusterZ: -40,
    },
    inspection: {
        color: 0xffb700, // Electric Amber
        hex: '#ffb700',
        label: 'Quality & Inspection',
        clusterX: 340,
        clusterY: 95,
        clusterZ: 30,
    },
    tool: {
        color: 0xd946ef, // Neon Magenta
        hex: '#d946ef',
        label: 'Tools & Support',
        clusterX: 420,
        clusterY: 70,
        clusterZ: -120,
    },
    user: {
        color: 0xf43f5e, // Crimson Rose
        hex: '#f43f5e',
        label: 'User & Security',
        clusterX: 620,
        clusterY: 105,
        clusterZ: 20,
    },
    system: {
        color: 0x38bdf8, // Sapphire Slate
        hex: '#38bdf8',
        label: 'Core System',
        clusterX: 780,
        clusterY: 60,
        clusterZ: -60,
    },
};

/**
 * Total Duration: Exactly 30.00 seconds
 */
const TOTAL_DURATION = 30.0;

export default function Futuristic3DEnvironment({
    schemaData = null,
    onClose = null,
    autoStartRecording = false,
}) {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);

    // Direct DOM refs for high-performance 60 FPS updates (zero React re-render lag)
    const timecodeRef = useRef(null);
    const timelineInputRef = useRef(null);
    const badgeTextRef = useRef(null);

    // Playback & Recording state
    const [isPlaying, setIsPlaying] = useState(true);
    const [isRecording, setIsRecording] = useState(false);
    const [recordedBlobUrl, setRecordedBlobUrl] = useState(null);
    const [viewMode, setViewMode] = useState('cinematic'); // 'cinematic' (30s flight), 'orbit' (interactive 3D)
    const [statsInfo, setStatsInfo] = useState({ nodes: 0, links: 0 });

    // Refs for animation loop
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const rendererRef = useRef(null);
    const animFrameIdRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const recordedChunksRef = useRef([]);
    const particlesRef = useRef([]);
    const nodesGroupRef = useRef(null);
    const linksGroupRef = useRef(null);
    const clockRef = useRef(new THREE.Clock());
    const playbackTimeRef = useRef(0);
    const isPlayingRef = useRef(true);
    const isRecordingRef = useRef(false);
    const viewModeRef = useRef('cinematic');

    // Orbit drag state for free mode
    const isDraggingRef = useRef(false);
    const prevMousePosRef = useRef({ x: 0, y: 0 });
    const orbitAnglesRef = useRef({ theta: 0.2, phi: 1.1, radius: 750 });

    isPlayingRef.current = isPlaying;
    isRecordingRef.current = isRecording;
    viewModeRef.current = viewMode;

    /**
     * Escape key to close
     */
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && onClose) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    /**
     * Build Blueprint-style Node Card
     */
    const createNodeCard = (name, catConfig) => {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 130;
        const ctx = canvas.getContext('2d');
        if (!ctx) return new THREE.Group();

        const safeHex = catConfig?.hex || '#38bdf8';
        const rawName = String(name || 'TABLE').toUpperCase();
        const displayName = rawName.replace(/_/g, ' ');

        // 1. Draw Body (Dark Slate)
        ctx.fillStyle = '#0f172a'; // Slate 900
        ctx.strokeStyle = '#334155'; // Slate 700
        ctx.lineWidth = 4;
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(4, 4, 392, 122, 12);
        } else {
            ctx.rect(4, 4, 392, 122);
        }
        ctx.fill();
        ctx.stroke();

        // 2. Draw Header (Colored top)
        ctx.fillStyle = safeHex;
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(4, 4, 392, 45, [12, 12, 0, 0]);
        } else {
            ctx.rect(4, 4, 392, 45);
        }
        ctx.fill();

        // 3. Header Text
        ctx.fillStyle = '#020617'; // Very dark text on bright header
        ctx.font = '900 22px "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText('DATABASE TABLE', 20, 26);

        // 4. Body Text (Table Name)
        ctx.fillStyle = '#f8fafc'; // Slate 50
        ctx.font = 'bold 28px "Segoe UI", system-ui, sans-serif';
        const truncated = displayName.length > 22 ? displayName.slice(0, 20) + '..' : displayName;
        ctx.fillText(truncated, 20, 85);

        // Create texture
        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;

        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: THREE.FrontSide
        });

        // Aspect ratio 400x130 = 3.07. Let's use 80 width x 26 height.
        const plane = new THREE.Mesh(new THREE.PlaneGeometry(80, 26), material);
        return plane;
    };

    /**
     * Camera Path Evaluation at Time T (0.0 to 30.0s)
     * Horizontal Blueprint Panning across the dynamic layout (-450 to 1700)
     */
    const evaluateCameraAtTime = (t) => {
        const clampedT = Math.max(0, Math.min(TOTAL_DURATION, t));
        const pos = new THREE.Vector3();
        const target = new THREE.Vector3();
        let badge = '';

        if (clampedT <= 4.0) {
            // PHASE 1: 0 - 4s (Start at Fleet)
            const p = clampedT / 4.0;
            const ease = 1 - Math.pow(1 - p, 3);
            pos.lerpVectors(new THREE.Vector3(-600, 100, 400), new THREE.Vector3(-400, 70, 300), ease);
            target.lerpVectors(new THREE.Vector3(-450, 70, 0), new THREE.Vector3(-300, 50, 0), ease);
            badge = 'SYSTEM INITIALIZATION • BLUEPRINT ENGINE ONLINE';
        } else if (clampedT <= 11.0) {
            // PHASE 2: 4 - 11s (Pan to Work Order)
            const p = (clampedT - 4.0) / 7.0;
            const ease = 0.5 - Math.cos(p * Math.PI) / 2;
            pos.lerpVectors(new THREE.Vector3(-400, 70, 300), new THREE.Vector3(50, 70, 300), ease);
            target.lerpVectors(new THREE.Vector3(-300, 50, 0), new THREE.Vector3(150, 50, 0), ease);
            badge = 'CLUSTER 1 • FLEET ASSETS & TELEMETRY';
        } else if (clampedT <= 18.5) {
            // PHASE 3: 11 - 18.5s (Pan to Inspection)
            const p = (clampedT - 11.0) / 7.5;
            const ease = 0.5 - Math.cos(p * Math.PI) / 2;
            pos.lerpVectors(new THREE.Vector3(50, 70, 300), new THREE.Vector3(450, 70, 300), ease);
            target.lerpVectors(new THREE.Vector3(150, 50, 0), new THREE.Vector3(500, 50, 0), ease);
            badge = 'CLUSTER 2 • WORK ORDER ENGINE & DISPATCH';
        } else if (clampedT <= 25.0) {
            // PHASE 4: 18.5 - 25s (Pan to System/User)
            const p = (clampedT - 18.5) / 6.5;
            const ease = 0.5 - Math.cos(p * Math.PI) / 2;
            pos.lerpVectors(new THREE.Vector3(450, 70, 300), new THREE.Vector3(1000, 70, 300), ease);
            target.lerpVectors(new THREE.Vector3(500, 50, 0), new THREE.Vector3(1050, 50, 0), ease);
            badge = 'CLUSTER 3 • CONDITION MONITORING & COMPONENTS';
        } else if (clampedT <= 28.5) {
            // PHASE 5: 25 - 28.5s (Governance / System)
            const p = (clampedT - 25.0) / 3.5;
            const ease = 0.5 - Math.cos(p * Math.PI) / 2;
            pos.lerpVectors(new THREE.Vector3(1000, 70, 300), new THREE.Vector3(1500, 70, 350), ease);
            target.lerpVectors(new THREE.Vector3(1050, 50, 0), new THREE.Vector3(1550, 50, 0), ease);
            badge = 'CLUSTER 4 • ENTERPRISE GOVERNANCE';
        } else {
            // PHASE 6: 28.5 - 30s (Zoom out wide)
            const p = (clampedT - 28.5) / 1.5;
            const ease = 0.5 - Math.cos(p * Math.PI) / 2;
            pos.lerpVectors(new THREE.Vector3(1500, 70, 350), new THREE.Vector3(600, 150, 1400), ease);
            target.lerpVectors(new THREE.Vector3(1550, 50, 0), new THREE.Vector3(600, 50, 0), ease);
            badge = 'TOPOLOGY COMPLETE • LIVE DATA STREAM ACTIVE';
        }

        return { pos, target, badge };
    };

    /**
     * Initialize Three.js 3D Universe
     */
    useEffect(() => {
        if (!containerRef.current || !canvasRef.current) return;

        const containerEl = containerRef.current;
        const width = Math.max(containerEl.clientWidth || window.innerWidth, 640);
        const height = Math.max(containerEl.clientHeight || window.innerHeight, 480);

        // 1. Scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x02050e);
        scene.fog = new THREE.FogExp2(0x02050e, 0.0006);
        sceneRef.current = scene;

        // 2. Camera
        const camera = new THREE.PerspectiveCamera(45, width / height, 5, 4000);
        camera.position.set(-220, 120, 280);
        camera.lookAt(-180, 80, 0);
        scene.add(camera);
        cameraRef.current = camera;

        // 3. Renderer with antialiasing and preserveDrawingBuffer for video recording
        let renderer;
        try {
            renderer = new THREE.WebGLRenderer({
                canvas: canvasRef.current,
                antialias: true,
                alpha: false,
                preserveDrawingBuffer: true,
                powerPreference: 'high-performance',
            });
        } catch {
            renderer = new THREE.WebGLRenderer({
                canvas: canvasRef.current,
                antialias: false,
                preserveDrawingBuffer: true,
            });
        }

        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.4;
        rendererRef.current = renderer;

        // 4. Lights
        const ambientLight = new THREE.AmbientLight(0x0a1628, 2.8);
        scene.add(ambientLight);

        const dirLight1 = new THREE.DirectionalLight(0x00e5ff, 2.5);
        dirLight1.position.set(300, 600, 400);
        scene.add(dirLight1);

        const dirLight2 = new THREE.DirectionalLight(0x10b981, 1.8);
        dirLight2.position.set(-300, 400, -200);
        scene.add(dirLight2);

        // Cyber Blueprint Background Grid
        const gridHelper = new THREE.GridHelper(2800, 120, 0x1e293b, 0x0f172a);
        gridHelper.rotation.x = Math.PI / 2; // Vertical wall
        gridHelper.position.z = -50;
        scene.add(gridHelper);

        // Deep Starfield Particles
        const starGeo = new THREE.BufferGeometry();
        const starCount = 1600;
        const starPositions = new Float32Array(starCount * 3);
        const starColors = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount; i++) {
            starPositions[i * 3] = (Math.random() - 0.5) * 2600;
            starPositions[i * 3 + 1] = Math.random() * 900 + 10;
            starPositions[i * 3 + 2] = (Math.random() - 0.5) * 2600;

            const c = new THREE.Color().setHSL(0.52 + Math.random() * 0.35, 0.85, 0.75);
            starColors[i * 3] = c.r;
            starColors[i * 3 + 1] = c.g;
            starColors[i * 3 + 2] = c.b;
        }

        starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

        const starMat = new THREE.PointsMaterial({
            size: 2.8,
            vertexColors: true,
            transparent: true,
            opacity: 0.75,
        });
        const starField = new THREE.Points(starGeo, starMat);
        scene.add(starField);

        // 5. Build Database Nodes & Relationships
        const nodesGroup = new THREE.Group();
        const linksGroup = new THREE.Group();
        scene.add(nodesGroup);
        scene.add(linksGroup);
        nodesGroupRef.current = nodesGroup;
        linksGroupRef.current = linksGroup;

        // Populate 3D Nodes & Conduits
        const loadSchemaAndBuildScene = (data) => {
            if (!data || !data.nodes || !data.nodes.length) return;

            const nodes = data.nodes;
            const links = data.links || [];
            setStatsInfo({ nodes: nodes.length, links: links.length });

            const nodePositionsMap = new Map();
            
            // Organize nodes by category first to prevent overlaps
            const groupedNodes = {};
            nodes.forEach(node => {
                const cat = node.category || 'system';
                if (!groupedNodes[cat]) groupedNodes[cat] = [];
                groupedNodes[cat].push(node);
            });

            const categoryOrder = ['fleet', 'work_order', 'inspection', 'tool', 'user', 'system'];
            let globalX = -450; // Start far left

            categoryOrder.forEach(cat => {
                const catNodes = groupedNodes[cat] || [];
                if (catNodes.length === 0) return;

                const catConfig = CATEGORY_PALETTE[cat] || CATEGORY_PALETTE.system;
                const cols = 2; // 2 columns max per cluster for vertical stacking
                
                catNodes.forEach((node, idx) => {
                    const row = Math.floor(idx / cols);
                    const col = idx % cols;

                    // Node width 80 + gap 40 = 120 horizontal space
                    const posX = globalX + col * 120;
                    // Node height 26 + gap 34 = 60 vertical space
                    const posY = 150 - row * 60;
                    const posZ = 0; // Flat layout

                    const posVector = new THREE.Vector3(posX, posY, posZ);
                    nodePositionsMap.set(node.id, posVector);

                    // --- 2D BLUEPRINT NODE CARD ---
                    const nodeObject = createNodeCard(node.name || node.label, catConfig);
                    nodeObject.position.copy(posVector);
                    nodesGroup.add(nodeObject);
                });

                // Advance globalX for the next category block (2 columns = 240, plus 160 gap = 400)
                globalX += (cols * 120) + 160; 
            });

            // --- BUILD 3D RELATIONSHIP CONDUITS & DATA PARTICLES ---
            const particlesList = [];

            links.forEach((link) => {
                if (!link || !link.source || !link.target) return;
                const srcPos = nodePositionsMap.get(link.source);
                const tgtPos = nodePositionsMap.get(link.target);

                if (!srcPos || !tgtPos) return;

                // Cubic Bezier Curve for Blueprint style lines
                const startPoint = new THREE.Vector3(srcPos.x + 40, srcPos.y, srcPos.z); // Right edge of source
                const endPoint = new THREE.Vector3(tgtPos.x - 40, tgtPos.y, tgtPos.z);   // Left edge of target
                
                // Calculate appropriate curve offset based on distance
                const distance = srcPos.distanceTo(tgtPos);
                const dx = Math.abs(endPoint.x - startPoint.x);
                const offset = Math.max(60, dx * 0.4);

                const cp1 = new THREE.Vector3(startPoint.x + offset, startPoint.y, startPoint.z);
                const cp2 = new THREE.Vector3(endPoint.x - offset, endPoint.y, endPoint.z);

                const curve = new THREE.CubicBezierCurve3(startPoint, cp1, cp2, endPoint);
                const points = curve.getPoints(50);
                const lineGeo = new THREE.BufferGeometry().setFromPoints(points);

                let lineColor = 0x00e5ff; // Foreign Key (Cyan)
                if (link.type === 'eloquent') lineColor = 0x10b981; // Eloquent (Emerald)
                else if (link.type === 'logical') lineColor = 0xfbbf24; // Logical (Amber)

                const lineMat = new THREE.LineBasicMaterial({
                    color: lineColor,
                    transparent: true,
                    opacity: 0.6,
                    linewidth: 2,
                });
                const lineMesh = new THREE.Line(lineGeo, lineMat);
                linksGroup.add(lineMesh);

                const photonCount = distance > 400 ? 3 : 2;
                for (let pIdx = 0; pIdx < photonCount; pIdx++) {
                    const photonGeo = new THREE.SphereGeometry(1.8, 8, 8);
                    const photonMat = new THREE.MeshBasicMaterial({
                        color: lineColor,
                    });
                    const photonMesh = new THREE.Mesh(photonGeo, photonMat);
                    scene.add(photonMesh);

                    particlesList.push({
                        mesh: photonMesh,
                        curve,
                        progress: (pIdx / photonCount + Math.random() * 0.2) % 1.0,
                        speed: 0.16 + Math.random() * 0.1,
                    });
                }
            });

            particlesRef.current = particlesList;
        };

        if (schemaData && schemaData.nodes && schemaData.nodes.length) {
            loadSchemaAndBuildScene(schemaData);
        } else {
            fetch('/api/database-schema')
                .then((res) => res.json())
                .then((data) => {
                    if (data && data.nodes) {
                        loadSchemaAndBuildScene({
                            nodes: data.nodes,
                            links: data.links,
                        });
                    }
                })
                .catch((err) => console.error('Failed to load schema for 3D environment', err));
        }

        // 6. Handle Window Resize
        const handleResize = () => {
            if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
            const w = Math.max(containerRef.current.clientWidth || window.innerWidth, 640);
            const h = Math.max(containerRef.current.clientHeight || window.innerHeight, 480);
            cameraRef.current.aspect = w / h;
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.setSize(w, h);
        };
        window.addEventListener('resize', handleResize);

        // 7. Master Render & Animation Loop (60 FPS)
        clockRef.current.start();

        const animate = () => {
            animFrameIdRef.current = requestAnimationFrame(animate);

            const delta = clockRef.current.getDelta();

            // A. Update Timeline
            if (isPlayingRef.current) {
                playbackTimeRef.current += delta;
                if (playbackTimeRef.current >= TOTAL_DURATION) {
                    playbackTimeRef.current = TOTAL_DURATION;
                    if (isRecordingRef.current) {
                        stopRecordingInternal();
                    }
                    isPlayingRef.current = false;
                    setIsPlaying(false);
                }

                const t = playbackTimeRef.current;

                // Direct DOM update (no React lag)
                if (timecodeRef.current) {
                    timecodeRef.current.textContent = `${t.toFixed(2)}s / 30.00s`;
                }
                if (timelineInputRef.current) {
                    timelineInputRef.current.value = t;
                }
            }

            // B. Animate Nodes (Subtle breathing effect)
            if (nodesGroupRef.current) {
                // Nodes are now static 2D cards, no complex 3D rotation needed.
                // We can add a very subtle scale pulse if desired, or just leave them flat.
            }

            // C. Animate Data Flow Photons along Real Relationship Curves
            particlesRef.current.forEach((p) => {
                p.progress = (p.progress + p.speed * delta) % 1.0;
                const point = p.curve.getPoint(p.progress);
                p.mesh.position.copy(point);
            });

            // D. Camera Controller Logic
            if (viewModeRef.current === 'cinematic' && cameraRef.current) {
                const { pos, target, badge } = evaluateCameraAtTime(playbackTimeRef.current);
                cameraRef.current.position.copy(pos);
                cameraRef.current.lookAt(target);

                if (badgeTextRef.current && badge) {
                    badgeTextRef.current.textContent = badge;
                }
            } else if (viewModeRef.current === 'orbit' && cameraRef.current) {
                const { theta, phi, radius } = orbitAnglesRef.current;
                cameraRef.current.position.x = radius * Math.sin(phi) * Math.sin(theta) + 100;
                cameraRef.current.position.y = radius * Math.cos(phi) + 50;
                cameraRef.current.position.z = radius * Math.sin(phi) * Math.cos(theta);
                cameraRef.current.lookAt(100, 60, 0);
            }

            // Render Frame
            if (rendererRef.current && sceneRef.current && cameraRef.current) {
                rendererRef.current.render(sceneRef.current, cameraRef.current);
            }
        };

        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            if (animFrameIdRef.current) {
                cancelAnimationFrame(animFrameIdRef.current);
            }
            if (rendererRef.current) {
                rendererRef.current.dispose();
            }
        };
    }, []);

    /**
     * Mouse Orbit Controls for Free Mode
     */
    const handleMouseDown = (e) => {
        if (viewMode !== 'orbit') return;
        isDraggingRef.current = true;
        prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
        if (viewMode !== 'orbit' || !isDraggingRef.current) return;
        const dx = e.clientX - prevMousePosRef.current.x;
        const dy = e.clientY - prevMousePosRef.current.y;
        prevMousePosRef.current = { x: e.clientX, y: e.clientY };

        orbitAnglesRef.current.theta -= dx * 0.005;
        orbitAnglesRef.current.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, orbitAnglesRef.current.phi - dy * 0.005));
    };

    const handleMouseUp = () => {
        isDraggingRef.current = false;
    };

    const handleWheel = (e) => {
        if (viewMode !== 'orbit') return;
        orbitAnglesRef.current.radius = Math.max(200, Math.min(1800, orbitAnglesRef.current.radius + e.deltaY * 0.8));
    };

    /**
     * Timeline Controls
     */
    const handlePlayPause = () => {
        if (playbackTimeRef.current >= TOTAL_DURATION) {
            playbackTimeRef.current = 0;
        }
        isPlayingRef.current = !isPlaying;
        setIsPlaying(!isPlaying);
    };

    const handleReset = () => {
        playbackTimeRef.current = 0;
        if (timecodeRef.current) timecodeRef.current.textContent = '0.00s / 30.00s';
        if (timelineInputRef.current) timelineInputRef.current.value = 0;
        isPlayingRef.current = true;
        setIsPlaying(true);
    };

    const handleSeek = (e) => {
        const val = parseFloat(e.target.value);
        playbackTimeRef.current = val;
        if (timecodeRef.current) timecodeRef.current.textContent = `${val.toFixed(2)}s / 30.00s`;
    };

    /**
     * High-Definition Video Recorder (Canvas to WebM/MP4)
     * Records exactly 30 seconds of the cinematic 3D flight!
     */
    const startRecordingWorkflow = useCallback(() => {
        if (!canvasRef.current || isRecording) return;

        playbackTimeRef.current = 0;
        if (timecodeRef.current) timecodeRef.current.textContent = '0.00s / 30.00s';
        if (timelineInputRef.current) timelineInputRef.current.value = 0;

        viewModeRef.current = 'cinematic';
        setViewMode('cinematic');
        isPlayingRef.current = true;
        setIsPlaying(true);
        isRecordingRef.current = true;
        setIsRecording(true);
        setRecordedBlobUrl(null);
        recordedChunksRef.current = [];

        try {
            const stream = canvasRef.current.captureStream(60);

            let mimeType = 'video/webm;codecs=vp9';
            if (!MediaRecorder.isTypeSupported(mimeType)) {
                mimeType = 'video/webm;codecs=vp8';
                if (!MediaRecorder.isTypeSupported(mimeType)) {
                    mimeType = 'video/webm';
                    if (!MediaRecorder.isTypeSupported(mimeType)) {
                        mimeType = '';
                    }
                }
            }

            const options = mimeType ? { mimeType, videoBitsPerSecond: 12000000 } : { videoBitsPerSecond: 12000000 };
            const recorder = new MediaRecorder(stream, options);

            recorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    recordedChunksRef.current.push(e.data);
                }
            };

            recorder.onstop = () => {
                const blob = new Blob(recordedChunksRef.current, { type: mimeType || 'video/webm' });
                const url = URL.createObjectURL(blob);
                setRecordedBlobUrl(url);
                isRecordingRef.current = false;
                setIsRecording(false);

                // Auto-trigger video download
                const a = document.createElement('a');
                a.href = url;
                a.download = `Plant_Maintenance_Database_Workflow_30s_${new Date().toISOString().slice(0, 10)}.webm`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            };

            recorder.start(500);
            mediaRecorderRef.current = recorder;
        } catch (err) {
            console.error('Recording initialization failed:', err);
            isRecordingRef.current = false;
            setIsRecording(false);
            alert('Perekaman WebGL tidak didukung di browser ini: ' + err.message);
        }
    }, [isRecording]);

    const stopRecordingInternal = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        isRecordingRef.current = false;
        setIsRecording(false);
    };

    // Render using createPortal directly into document.body to escape any parent CSS overflow/transforms
    const modalContent = (
        <div
            ref={containerRef}
            className="fixed inset-0 z-[99999] w-screen h-screen bg-[#02050e] overflow-hidden select-none font-sans"
            style={{ width: '100vw', height: '100vh', top: 0, left: 0 }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onWheel={handleWheel}
        >
            {/* 3D WebGL Canvas */}
            <canvas
                ref={canvasRef}
                className="w-full h-full block cursor-grab active:cursor-grabbing"
                style={{ width: '100%', height: '100%' }}
            />

            {/* Top Futuristic HUD Header */}
            <div className="absolute top-0 inset-x-0 p-5 bg-gradient-to-b from-black/90 via-black/40 to-transparent flex flex-wrap items-center justify-between gap-4 pointer-events-none z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 font-mono text-xl shadow-[0_0_15px_rgba(0,229,255,0.4)]">
                        🌐
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-white font-black text-base md:text-lg tracking-wider uppercase drop-shadow-[0_0_12px_rgba(0,229,255,0.6)]">
                                3D CINEMATIC DATABASE WORKFLOW
                            </h2>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-400/20 text-cyan-200 border border-cyan-400/40">
                                30 SECONDS TIMELINE
                            </span>
                        </div>
                        <p ref={badgeTextRef} className="text-xs text-cyan-200/80 font-mono">
                            SYSTEM INITIALIZATION • 52 ENTERPRISE QUANTUM NODES ONLINE
                        </p>
                    </div>
                </div>

                {/* Right Top Controls */}
                <div className="flex items-center gap-2 pointer-events-auto">
                    {/* Flight vs Free Orbit Mode Toggle */}
                    <div className="bg-slate-900/90 p-1 rounded-xl border border-cyan-500/30 flex items-center gap-1 shadow-lg backdrop-blur">
                        <button
                            type="button"
                            onClick={() => {
                                viewModeRef.current = 'cinematic';
                                setViewMode('cinematic');
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                                viewMode === 'cinematic'
                                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(0,229,255,0.6)]'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <Compass className="w-3.5 h-3.5" />
                            <span>Flight (30s)</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                viewModeRef.current = 'orbit';
                                setViewMode('orbit');
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                                viewMode === 'orbit'
                                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(0,229,255,0.6)]'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <Layers className="w-3.5 h-3.5" />
                            <span>Free 3D Orbit</span>
                        </button>
                    </div>

                    {/* Close Button */}
                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.5)] transition"
                            title="Tutup Mode 3D Sinematik"
                        >
                            <X className="w-4 h-4" />
                            <span>KELUAR (ESC)</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Bottom Cinematic HUD & Controls */}
            <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-black/95 via-black/60 to-transparent z-10">
                <div className="max-w-5xl mx-auto space-y-3">
                    {/* Time Progress Bar (0 to 30s) */}
                    <div className="relative">
                        <input
                            ref={timelineInputRef}
                            type="range"
                            min="0"
                            max={TOTAL_DURATION}
                            step="0.05"
                            defaultValue="0"
                            onChange={handleSeek}
                            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
                        />
                        {/* Phase Markers */}
                        <div className="flex justify-between text-[10px] font-mono text-cyan-400/70 mt-1 px-1">
                            <span>0s • Scan</span>
                            <span className="hidden sm:inline">4s • Fleet</span>
                            <span>11s • Work Orders</span>
                            <span className="hidden sm:inline">18s • Condition</span>
                            <span>25s • Governance</span>
                            <span className="text-cyan-300 font-bold">30s • Full Topology</span>
                        </div>
                    </div>

                    {/* Controls Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 border border-cyan-500/30 p-3 rounded-2xl backdrop-blur-md shadow-2xl">
                        {/* Playback & Reset Buttons */}
                        <div className="flex items-center gap-2.5">
                            <button
                                type="button"
                                onClick={handlePlayPause}
                                className="w-10 h-10 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center justify-center transition shadow-[0_0_15px_rgba(0,229,255,0.5)]"
                            >
                                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                            </button>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 flex items-center justify-center transition border border-slate-700"
                                title="Ulangi dari 0s"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>

                            {/* Digital Timecode Display */}
                            <div
                                ref={timecodeRef}
                                className="font-mono text-sm font-black bg-black/80 px-3 py-1.5 rounded-lg border border-cyan-500/40 text-cyan-300"
                            >
                                0.00s / 30.00s
                            </div>
                        </div>

                        {/* Mid Indicator: Active Data Stream Status */}
                        <div className="hidden md:flex items-center gap-3 text-xs font-mono text-slate-300">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                <span>{statsInfo.nodes || 52} Quantum Nodes</span>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                                <span>{statsInfo.links || 60} Neural Conduits</span>
                            </span>
                            <span>•</span>
                            <span className="text-cyan-400 font-bold">60 FPS WebGL</span>
                        </div>

                        {/* Record Video Action */}
                        <div className="flex items-center gap-2">
                            {recordedBlobUrl && (
                                <a
                                    href={recordedBlobUrl}
                                    download="Plant_Maintenance_Database_Workflow_30s.webm"
                                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.5)] transition"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Unduh Video (30s)</span>
                                </a>
                            )}

                            <button
                                type="button"
                                onClick={isRecording ? stopRecordingInternal : startRecordingWorkflow}
                                className={`px-5 py-2 rounded-xl font-black text-xs transition flex items-center gap-2 shadow-lg ${
                                    isRecording
                                        ? 'bg-red-600 text-white animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.8)]'
                                        : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-[0_0_18px_rgba(225,29,72,0.5)]'
                                }`}
                            >
                                <Video className="w-4 h-4" />
                                <span>{isRecording ? 'Merekam... (Stop)' : '🎬 Rekam Video 30 Detik'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (typeof document !== 'undefined') {
        return createPortal(modalContent, document.body);
    }
    return modalContent;
}
