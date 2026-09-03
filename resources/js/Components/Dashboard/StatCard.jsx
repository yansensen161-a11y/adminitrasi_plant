import React from 'react';

export default function StatCard({ title, value, change, isPositive, icon, colorClass = "text-sky-500", trendData = [] }) {
    // Generate a simple SVG sparkline based on trendData if provided
    const max = Math.max(...trendData, 1);
    const min = Math.min(...trendData, 0);
    const range = max - min || 1;
    const sparklinePoints = trendData.map((val, i) => {
        const x = (i / (trendData.length - 1)) * 100;
        const y = 100 - (((val - min) / range) * 100);
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="glass-card bg-gray-900/50 dark:bg-gray-900/40 rounded-xl p-5 relative overflow-hidden group border border-gray-800">
            {/* Top accent border */}
            <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-${colorClass.split('-')[1]}-500 to-transparent opacity-50`}></div>
            
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl bg-gray-800/80 shadow-inner ${colorClass}`}>
                    {icon}
                </div>
                <div className="text-right">
                    <div className="text-sm font-medium text-gray-400 tracking-wide mb-1">{title}</div>
                    <div className="text-3xl font-bold text-gray-100">{value}</div>
                </div>
            </div>

            <div className="flex items-end justify-between mt-4">
                <div className={`flex items-center text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {isPositive ? (
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                    )}
                    {change} <span className="text-gray-500 ml-1 font-normal text-xs">vs last 24h</span>
                </div>
                
                {trendData.length > 0 && (
                    <div className="w-20 h-10 opacity-60 group-hover:opacity-100 transition-opacity">
                        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={`w-full h-full stroke-current ${isPositive ? 'text-green-500' : 'text-red-500'}`} fill="none">
                            <polyline points={sparklinePoints} strokeWidth="4" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                )}
            </div>
        </div>
    );
}
