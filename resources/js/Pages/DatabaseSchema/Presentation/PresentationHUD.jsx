import React from 'react';
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    RotateCcw,
    Maximize2,
    Minimize2,
    Volume2,
    VolumeX,
    Subtitles,
    Video,
    Square,
    X,
    Sparkles,
} from 'lucide-react';

/**
 * PresentationHUD.jsx
 * Cinematic playback controls and progress indicator for presentation mode.
 */
export default function PresentationHUD({
    isPlaying,
    onTogglePlay,
    onPrev,
    onNext,
    onRestart,
    currentSceneIndex,
    totalScenes,
    currentScene,
    isAutoPlay,
    onToggleAutoPlay,
    isNarrationEnabled,
    onToggleNarration,
    isSubtitlesVisible,
    onToggleSubtitles,
    isFullscreen,
    onToggleFullscreen,
    isRecording,
    recordingTime,
    onToggleRecord,
    onExit,
    speed,
    onChangeSpeed,
}) {
    const progressPercent = totalScenes > 0 ? ((currentSceneIndex + 1) / totalScenes) * 100 : 0;

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="absolute bottom-3 left-0 right-0 z-50 flex flex-col items-center px-4 pointer-events-auto select-none">
            {/* Minimal Scene Category & Step Indicator */}
            <div className="mb-2 flex items-center gap-2.5 bg-[#070b16]/90 border border-slate-700/80 px-3.5 py-1 rounded-full shadow-lg backdrop-blur-md text-xs">
                <span className="font-mono text-cyan-400 font-bold">
                    {String(currentSceneIndex + 1).padStart(2, '0')} / {String(totalScenes).padStart(2, '0')}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-500"></span>
                <span className="text-slate-300 font-semibold tracking-wide uppercase text-[11px] truncate max-w-xs">
                    {currentScene?.categoryLabel || currentScene?.title || 'WALKTHROUGH'}
                </span>
                {isRecording && (
                    <span className="flex items-center gap-1.5 bg-rose-500/20 text-rose-400 border border-rose-500/40 px-2 py-0.5 rounded-full text-[10px] font-mono animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                        REC {formatTime(recordingTime)}
                    </span>
                )}
            </div>

            {/* Bottom Glassmorphic Control Bar */}
            <div className="relative w-full max-w-2xl bg-[#090e1f]/95 border border-slate-700/80 rounded-2xl p-2 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-2">
                {/* Thin Sleek Progress Line at Top Edge */}
                <div className="absolute -top-1 left-3 right-3 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 transition-all duration-300 rounded-full"
                        style={{ width: `${progressPercent}%` }}
                    ></div>
                </div>

                {/* Left: Playback Navigation */}
                <div className="flex items-center gap-1">
                    {/* Previous Button */}
                    <button
                        onClick={onPrev}
                        disabled={currentSceneIndex === 0}
                        className="p-2 text-slate-300 hover:text-white disabled:opacity-30 hover:bg-slate-800/80 rounded-xl transition"
                        title="Scene Sebelumnya (Panah Kiri)"
                    >
                        <SkipBack className="w-4 h-4" />
                    </button>

                    {/* Play / Pause Main Button */}
                    <button
                        onClick={onTogglePlay}
                        className="p-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl shadow-lg shadow-cyan-900/40 transition active:scale-95"
                        title={isPlaying ? 'Jeda (Spasi)' : 'Putar (Spasi)'}
                    >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                    </button>

                    {/* Next Button */}
                    <button
                        onClick={onNext}
                        disabled={currentSceneIndex >= totalScenes - 1}
                        className="p-2 text-slate-300 hover:text-white disabled:opacity-30 hover:bg-slate-800/80 rounded-xl transition"
                        title="Scene Berikutnya (Panah Kanan)"
                    >
                        <SkipForward className="w-4 h-4" />
                    </button>

                    {/* Restart Button */}
                    <button
                        onClick={onRestart}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition"
                        title="Mulai Ulang dari Awal"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                </div>

                {/* Center: Auto Play & Speed */}
                <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
                    <button
                        onClick={onToggleAutoPlay}
                        className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold transition ${
                            isAutoPlay
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                : 'text-slate-400 hover:text-white'
                        }`}
                        title="Mode Otomatis / Manual"
                    >
                        {isAutoPlay ? 'AUTO' : 'MANUAL'}
                    </button>

                    <button
                        onClick={() => {
                            const nextSpeed = speed === 1 ? 1.5 : speed === 1.5 ? 0.75 : 1;
                            onChangeSpeed(nextSpeed);
                        }}
                        className="text-[11px] font-mono px-2 py-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        title="Kecepatan Animasi"
                    >
                        {speed}x
                    </button>
                </div>

                {/* Right: Audio, Subtitle, Record, Fullscreen & Exit */}
                <div className="flex items-center gap-1">
                    {/* Audio Narration Toggle */}
                    <button
                        onClick={onToggleNarration}
                        className={`p-2 rounded-xl transition ${
                            isNarrationEnabled
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                        }`}
                        title={isNarrationEnabled ? 'Suara Narasi Aktif (Mute)' : 'Nyalakan Suara Narasi'}
                    >
                        {isNarrationEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    </button>

                    {/* Subtitles Toggle */}
                    <button
                        onClick={onToggleSubtitles}
                        className={`p-2 rounded-xl transition ${
                            isSubtitlesVisible
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                        }`}
                        title="Tampilkan / Sembunyikan Takarir (CC)"
                    >
                        <Subtitles className="w-4 h-4" />
                    </button>

                    {/* Record Video Button */}
                    <button
                        onClick={onToggleRecord}
                        className={`px-2.5 py-1.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition ${
                            isRecording
                                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/50'
                                : 'bg-slate-800 hover:bg-slate-700 text-rose-400 border border-rose-500/30'
                        }`}
                        title={isRecording ? 'Hentikan Perekaman & Simpan Video' : 'Mulai Rekam Video 1080p (30 FPS)'}
                    >
                        {isRecording ? (
                            <>
                                <Square className="w-3.5 h-3.5 fill-white" />
                                <span>Stop</span>
                            </>
                        ) : (
                            <>
                                <Video className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Rekam</span>
                            </>
                        )}
                    </button>

                    {/* Fullscreen Toggle */}
                    <button
                        onClick={onToggleFullscreen}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition"
                        title="Layar Penuh (F)"
                    >
                        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>

                    {/* Exit Presentation */}
                    <button
                        onClick={onExit}
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition ml-1"
                        title="Keluar Mode Presentasi (Esc)"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
