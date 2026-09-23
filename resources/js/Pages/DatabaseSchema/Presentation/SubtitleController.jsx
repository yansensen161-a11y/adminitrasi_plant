import React from 'react';

/**
 * SubtitleController.jsx
 * Cinematic glassmorphic subtitle container at the bottom of the presentation.
 */
export default function SubtitleController({ currentScene, isVisible = true }) {
    if (!isVisible || !currentScene || !currentScene.narration) {
        return null;
    }

    const getBadgeStyle = (scene) => {
        switch (scene.type) {
            case 'intro':
            case 'overview':
            case 'outro':
                return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
            case 'module-intro':
                return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
            case 'table-focus':
                return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
            case 'relationship':
                return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
            default:
                return 'bg-slate-700/50 text-slate-300 border-slate-600';
        }
    };

    const getBadgeLabel = (scene) => {
        switch (scene.type) {
            case 'intro':
                return 'ARSITEKTUR CMMS';
            case 'overview':
                return 'OVERVIEW GLOBAL';
            case 'module-intro':
                return scene.categoryLabel ? `MODUL: ${scene.categoryLabel.toUpperCase()}` : 'MODUL';
            case 'table-focus':
                return `TABEL: ${scene.tableName?.toUpperCase()}`;
            case 'relationship':
                return `RELASI: ${scene.sourceId} ➔ ${scene.targetId}`;
            case 'outro':
                return 'KESIMPULAN SISTEM';
            default:
                return 'DATABASE SCHEMA';
        }
    };

    return (
        <div className="absolute bottom-16 left-0 right-0 flex justify-center z-40 px-6 pointer-events-none">
            <div className="max-w-4xl w-full bg-[#050914]/90 border border-slate-700/70 backdrop-blur-xl rounded-2xl p-4 shadow-2xl shadow-black/80 flex items-start gap-3.5 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
                <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border whitespace-nowrap flex-shrink-0 ${getBadgeStyle(
                        currentScene
                    )}`}
                >
                    {getBadgeLabel(currentScene)}
                </span>
                <p className="text-sm md:text-base text-slate-200 font-medium leading-relaxed tracking-wide">
                    {currentScene.narration}
                </p>
            </div>
        </div>
    );
}
