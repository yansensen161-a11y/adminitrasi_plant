import React from 'react';

/**
 * RelationshipAnimator.jsx
 * Provides SVG definitions and animated moving particles along active bezier edge paths.
 */

export const RelationshipDefs = () => (
    <svg style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0, pointerEvents: 'none' }}>
        <defs>
            <filter id="presentation-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>

            <linearGradient id="edge-particle-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
        </defs>
    </svg>
);

/**
 * Animated moving particle along an edge bezier path
 * @param {string} edgePath SVG bezier path d attribute
 * @param {string} color Particle fill color
 * @param {number} duration Animation cycle duration in seconds
 */
export const EdgeParticle = ({ edgePath, color = '#38bdf8', duration = 1.6 }) => {
    if (!edgePath) return null;

    return (
        <g>
            {/* Outer halo particle */}
            <circle r="7" fill={color} opacity="0.3" filter="url(#presentation-glow)">
                <animateMotion dur={`${duration}s`} repeatCount="indefinite" path={edgePath} />
            </circle>

            {/* Core glowing particle */}
            <circle r="3.5" fill="#ffffff" filter="url(#presentation-glow)">
                <animateMotion dur={`${duration}s`} repeatCount="indefinite" path={edgePath} />
            </circle>
        </g>
    );
};
