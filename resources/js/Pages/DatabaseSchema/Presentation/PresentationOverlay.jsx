import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useReactFlow } from '@xyflow/react';
import { CameraController } from './CameraController';
import { NarrationController } from './NarrationController';
import { VideoRecorder } from './VideoRecorder';
import { generatePresentationScenes } from './SceneGenerator';
import SubtitleController from './SubtitleController';
import PresentationHUD from './PresentationHUD';
import {
    Database,
    Key,
    Link2,
    Layers,
    Sparkles,
    ShieldCheck,
    Truck,
    Wrench,
    Hammer,
    Users,
    Cpu,
    ArrowRight,
} from 'lucide-react';

const CATEGORY_ICONS = {
    fleet: Truck,
    work_order: Wrench,
    inspection: ShieldCheck,
    tool: Hammer,
    user: Users,
    system: Cpu,
};

/**
 * PresentationOverlay.jsx
 * Full cinematic presentation engine for Database Schema architecture.
 */
export default function PresentationOverlay({
    isActive,
    onExit,
    nodes,
    edges,
    categoryConfig,
    onUpdatePresentationHighlights,
    containerRef,
}) {
    const reactFlow = useReactFlow();

    // Controllers
    const cameraRef = useRef(null);
    const narrationRef = useRef(null);
    const recorderRef = useRef(null);
    const timerRef = useRef(null);

    // Presentation States
    const [scenes, setScenes] = useState([]);
    const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isAutoPlay, setIsAutoPlay] = useState(true);
    const [speed, setSpeed] = useState(1);
    const [isNarrationEnabled, setIsNarrationEnabled] = useState(false);
    const [isSubtitlesVisible, setIsSubtitlesVisible] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);

    // Initialize Controllers
    useEffect(() => {
        if (!cameraRef.current && reactFlow) {
            cameraRef.current = new CameraController(reactFlow);
        }
        if (!narrationRef.current) {
            narrationRef.current = new NarrationController();
        }
        if (!recorderRef.current) {
            recorderRef.current = new VideoRecorder();
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            if (narrationRef.current) narrationRef.current.stop();
            if (recorderRef.current) recorderRef.current.cleanup();
            if (cameraRef.current) cameraRef.current.cancel();
        };
    }, [reactFlow]);

    // Presentation initialization and caching
    const isInitializedRef = useRef(false);
    const nodeMapRef = useRef(new Map());

    // Generate scenes ONCE when presentation activates
    useEffect(() => {
        if (isActive && nodes.length > 0) {
            if (!isInitializedRef.current) {
                isInitializedRef.current = true;

                // Cache node map with calculated layout coordinates
                const map = new Map();
                nodes.forEach((n) => map.set(n.id, n));
                nodeMapRef.current = map;

                const generated = generatePresentationScenes(nodes, edges, categoryConfig);
                setScenes(generated);
                setCurrentSceneIndex(0);
                setIsPlaying(true);
            }
        } else if (!isActive) {
            isInitializedRef.current = false;
            setScenes([]);
            setCurrentSceneIndex(0);
            setIsPlaying(false);
        }
    }, [isActive, nodes, edges, categoryConfig]);

    const currentScene = scenes[currentSceneIndex] || null;

    // Apply camera move and visual highlighting for the current scene
    const executeScene = useCallback(
        (scene) => {
            if (!scene || !cameraRef.current) return;

            // 1. Audio Narration
            if (narrationRef.current) {
                narrationRef.current.setEnabled(isNarrationEnabled);
                narrationRef.current.speak(scene.narration);
            }

            // 2. Camera & Node Highlighting
            switch (scene.type) {
                case 'intro': {
                    onUpdatePresentationHighlights(null, null, []);
                    cameraRef.current.showOverview(1500);
                    break;
                }
                case 'overview': {
                    onUpdatePresentationHighlights(null, null, []);
                    cameraRef.current.showOverview(1500);
                    break;
                }
                case 'module-intro': {
                    const moduleNodes = scene.tableIds ? scene.tableIds.map((id) => nodeMapRef.current.get(id)).filter(Boolean) : [];
                    onUpdatePresentationHighlights(null, null, scene.tableIds || []);
                    cameraRef.current.focusModule(moduleNodes, 1400);
                    break;
                }
                case 'table-focus': {
                    const targetNode = nodeMapRef.current.get(scene.tableId);
                    if (targetNode) {
                        onUpdatePresentationHighlights(scene.tableId, null, []);
                        cameraRef.current.focusTable(targetNode, 1.35, 1200);
                    }
                    break;
                }
                case 'relationship': {
                    const sNode = nodeMapRef.current.get(scene.sourceId);
                    const tNode = nodeMapRef.current.get(scene.targetId);
                    if (sNode && tNode) {
                        onUpdatePresentationHighlights(scene.sourceId, scene.edgeId, [scene.sourceId, scene.targetId]);
                        cameraRef.current.followRelationship(sNode, tNode, 1600);
                    }
                    break;
                }
                case 'outro': {
                    onUpdatePresentationHighlights(null, null, []);
                    cameraRef.current.showOverview(1800);
                    break;
                }
                default:
                    break;
            }
        },
        [onUpdatePresentationHighlights, isNarrationEnabled]
    );

    // Execute current scene when scene index changes
    useEffect(() => {
        if (!isActive || !scenes.length) return;
        const scene = scenes[currentSceneIndex];
        if (scene) {
            executeScene(scene);
        }
    }, [isActive, currentSceneIndex, scenes, executeScene]);

    // Auto Play Timer Loop
    useEffect(() => {
        if (!isActive || !isPlaying || !isAutoPlay || !scenes.length) {
            if (timerRef.current) clearTimeout(timerRef.current);
            return;
        }

        const scene = scenes[currentSceneIndex];
        if (!scene) return;

        const duration = (scene.duration || 4000) / speed;

        timerRef.current = setTimeout(() => {
            setCurrentSceneIndex((prev) => {
                if (prev < scenes.length - 1) {
                    return prev + 1;
                } else {
                    // Reached end of presentation
                    setIsPlaying(false);
                    return prev;
                }
            });
        }, duration);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [isActive, isPlaying, isAutoPlay, currentSceneIndex, scenes, speed]);

    // Playback Controls
    const handleTogglePlay = () => {
        setIsPlaying(!isPlaying);
        if (narrationRef.current) {
            if (isPlaying) narrationRef.current.pause();
            else narrationRef.current.resume();
        }
    };

    const handlePrev = () => {
        if (currentSceneIndex > 0) {
            setCurrentSceneIndex(currentSceneIndex - 1);
        }
    };

    const handleNext = () => {
        if (currentSceneIndex < scenes.length - 1) {
            setCurrentSceneIndex(currentSceneIndex + 1);
        }
    };

    const handleRestart = () => {
        setCurrentSceneIndex(0);
        setIsPlaying(true);
        if (scenes.length > 0) {
            executeScene(scenes[0]);
        }
    };

    const handleToggleAutoPlay = () => {
        setIsAutoPlay(!isAutoPlay);
    };

    const handleToggleNarration = () => {
        const nextState = !isNarrationEnabled;
        setIsNarrationEnabled(nextState);
        if (narrationRef.current) {
            narrationRef.current.setEnabled(nextState);
            if (nextState && currentScene) {
                narrationRef.current.speak(currentScene.narration);
            }
        }
    };

    const handleToggleSubtitles = () => {
        setIsSubtitlesVisible(!isSubtitlesVisible);
    };

    const handleToggleFullscreen = () => {
        if (!document.fullscreenElement) {
            if (containerRef?.current?.requestFullscreen) {
                containerRef.current.requestFullscreen();
                setIsFullscreen(true);
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    // Video Recording Handler
    const handleToggleRecord = async () => {
        if (!recorderRef.current) return;

        if (isRecording) {
            recorderRef.current.stopRecording();
            setIsRecording(false);
        } else {
            try {
                // Rewind to start and run presentation in recording mode
                setCurrentSceneIndex(0);
                setIsPlaying(true);
                setIsAutoPlay(true);
                setRecordingTime(0);

                await recorderRef.current.startRecording(containerRef?.current, (elapsed) => {
                    setRecordingTime(elapsed);
                });
                setIsRecording(true);
            } catch (err) {
                console.error('Recording cancelled or failed:', err);
                setIsRecording(false);
            }
        }
    };

    // Keyboard Shortcuts
    useEffect(() => {
        if (!isActive) return;

        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    handleTogglePlay();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    handleNext();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    handlePrev();
                    break;
                case 'Escape':
                    e.preventDefault();
                    onExit();
                    break;
                case 'KeyF':
                    e.preventDefault();
                    handleToggleFullscreen();
                    break;
                case 'KeyM':
                    e.preventDefault();
                    handleToggleNarration();
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isActive, isPlaying, currentSceneIndex, isNarrationEnabled, onExit]);

    if (!isActive) return null;

    const CategoryIcon = currentScene?.category ? CATEGORY_ICONS[currentScene.category] || Database : Database;

    return (
        <div className="absolute inset-0 z-40 pointer-events-none overflow-hidden select-none">
            {/* Dark Cinematic Vignette Background Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(5,9,20,0.85)_100%)] pointer-events-none"></div>

            {/* Top Bar: Presentation Header */}
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-[#050914]/90 via-[#050914]/50 to-transparent flex items-center justify-between z-40 pointer-events-auto">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-cyan-900/40">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
                                CINEMATIC WALKTHROUGH
                            </span>
                            <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded text-[10px] font-mono">
                                1080p
                            </span>
                        </div>
                        <h1 className="text-sm md:text-base font-extrabold text-white tracking-wide">
                            DATABASE ARCHITECTURE • PLANT CMMS
                        </h1>
                    </div>
                </div>

                {/* Exit presentation button in top right */}
                <button
                    onClick={onExit}
                    className="px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg backdrop-blur-md transition"
                >
                    <span>Keluar (Esc)</span>
                </button>
            </div>

            {/* Scene 1: Cinematic Title Card (Intro / Outro) */}
            {(currentScene?.type === 'intro' || currentScene?.type === 'outro') && (
                <div className="absolute inset-0 flex items-center justify-center z-50 bg-[#050914]/80 backdrop-blur-md p-6 pointer-events-none animate-in fade-in duration-700">
                    <div className="max-w-2xl text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-bold uppercase tracking-widest">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{currentScene.subtitle}</span>
                        </div>

                        <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-300 tracking-tight leading-tight">
                            {currentScene.title}
                        </h2>

                        <p className="text-sm md:text-base text-slate-300 max-w-lg mx-auto leading-relaxed">
                            {currentScene.description || currentScene.narration}
                        </p>

                        <div className="pt-2 flex items-center justify-center gap-4 text-xs font-mono text-cyan-400">
                            <span>{currentScene.meta}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Module Banner (floating top center during module scenes) */}
            {currentScene?.type === 'module-intro' && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 max-w-lg w-full px-4 pointer-events-none animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="bg-[#070c1e]/95 border border-cyan-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-xl text-center">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-xs font-bold mb-1.5">
                            <CategoryIcon className="w-4 h-4" />
                            <span>{currentScene.title}</span>
                        </div>
                        <h3 className="text-base font-bold text-white tracking-wide">
                            {currentScene.subtitle}
                        </h3>
                    </div>
                </div>
            )}

            {/* Active Table HUD Card (floating top right during table-focus scene) */}
            {currentScene?.type === 'table-focus' && (
                <div className="absolute top-20 right-6 z-40 w-80 pointer-events-none animate-in fade-in slide-in-from-right-4 duration-400">
                    <div className="bg-[#090e1f]/95 border-2 border-cyan-400/80 rounded-2xl p-4 shadow-2xl shadow-cyan-950/80 backdrop-blur-xl space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                                    {currentScene.categoryLabel}
                                </span>
                                <h3 className="text-base font-bold text-white tracking-wide">
                                    {currentScene.tableLabel}
                                </h3>
                                <p className="text-xs font-mono text-slate-400">{currentScene.tableName}</p>
                            </div>
                            <div className="text-right font-mono text-xs text-slate-400 bg-slate-800/80 px-2 py-1 rounded border border-slate-700">
                                {Number(currentScene.rowCount).toLocaleString()} rows
                            </div>
                        </div>

                        {/* Keys Badge Grid */}
                        <div className="space-y-2 text-xs">
                            <div className="flex items-center gap-2">
                                <Key className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                                <span className="text-slate-400">Primary Key:</span>
                                <span className="font-mono text-amber-300 font-bold">
                                    {currentScene.pkColumns?.join(', ') || 'id'}
                                </span>
                            </div>

                            {currentScene.fkColumns?.length > 0 && (
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Link2 className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                                        <span>Foreign Keys ({currentScene.fkColumns.length}):</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1 pt-0.5">
                                        {currentScene.fkColumns.slice(0, 4).map((fk, idx) => (
                                            <span
                                                key={idx}
                                                className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-500/30"
                                            >
                                                {fk}
                                            </span>
                                        ))}
                                        {currentScene.fkColumns.length > 4 && (
                                            <span className="text-[10px] text-slate-500 font-mono self-center">
                                                +{currentScene.fkColumns.length - 4} lainnya
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-slate-400 text-[11px]">
                                <span>{currentScene.columnCount} Kolom Database</span>
                                <span className="text-cyan-400 font-semibold">⚡ {currentScene.connectionCount} Relasi Terhubung</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Active Relationship HUD Card (floating during relationship scene) */}
            {currentScene?.type === 'relationship' && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 max-w-md w-full px-4 pointer-events-none animate-in fade-in slide-in-from-top-4 duration-400">
                    <div className="bg-[#090e1f]/95 border border-sky-500/60 rounded-2xl p-4 shadow-2xl backdrop-blur-xl text-center space-y-2">
                        <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                            {currentScene.relationTypeLabel}
                        </span>

                        <div className="flex items-center justify-center gap-3 text-sm font-bold text-white">
                            <span className="px-2.5 py-1 bg-slate-800 rounded-lg border border-slate-700">
                                {currentScene.sourceId}
                            </span>
                            <ArrowRight className="w-4 h-4 text-sky-400 animate-pulse" />
                            <span className="px-2.5 py-1 bg-slate-800 rounded-lg border border-slate-700">
                                {currentScene.targetId}
                            </span>
                        </div>

                        <p className="text-xs font-mono text-sky-300">
                            {currentScene.sourceId}.{currentScene.sourceCol} ➔ {currentScene.targetId}.{currentScene.targetCol}
                        </p>

                        {currentScene.description && (
                            <p className="text-xs text-slate-300 pt-1 border-t border-slate-800">
                                {currentScene.description}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Subtitle Component */}
            <SubtitleController currentScene={currentScene} isVisible={isSubtitlesVisible} />

            {/* Playback Controls & Progress HUD */}
            <PresentationHUD
                isPlaying={isPlaying}
                onTogglePlay={handleTogglePlay}
                onPrev={handlePrev}
                onNext={handleNext}
                onRestart={handleRestart}
                currentSceneIndex={currentSceneIndex}
                totalScenes={scenes.length}
                currentScene={currentScene}
                isAutoPlay={isAutoPlay}
                onToggleAutoPlay={handleToggleAutoPlay}
                isNarrationEnabled={isNarrationEnabled}
                onToggleNarration={handleToggleNarration}
                isSubtitlesVisible={isSubtitlesVisible}
                onToggleSubtitles={handleToggleSubtitles}
                isFullscreen={isFullscreen}
                onToggleFullscreen={handleToggleFullscreen}
                isRecording={isRecording}
                recordingTime={recordingTime}
                onToggleRecord={handleToggleRecord}
                onExit={onExit}
                speed={speed}
                onChangeSpeed={setSpeed}
            />
        </div>
    );
}
