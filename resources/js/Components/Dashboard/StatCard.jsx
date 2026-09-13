import React from 'react';

export default function StatCard({ title, value, change, isPositive, icon, colorClass = "text-primary-600", trendData = [] }) {
    // Generate a simple SVG sparkline based on trendData if provided
    const max = Math.max(...trendData, 1);
    const min = Math.min(...trendData, 0);
    const range = max - min || 1;
    const sparklinePoints = trendData.map((val, i) => {
        const x = (i / (trendData.length - 1)) * 100;
        const y = 100 - (((val - min) / range) * 100);
        return `${x},${y}`;
    }).join(' ');

    // Map colorClass to bg color
    const getBgColor = (colorClass) => {
        if (colorClass.includes('red')) return 'bg-red-50';
        if (colorClass.includes('orange') || colorClass.includes('amber')) return 'bg-amber-50';
        if (colorClass.includes('green')) return 'bg-green-50';
        if (colorClass.includes('blue') || colorClass.includes('sky')) return 'bg-sky-50';
        return 'bg-primary-50';
    };

    return (
        <div className="bg-white rounded-xl p-5 relative overflow-hidden group border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${getBgColor(colorClass)} ${colorClass}`}>
                    {icon}
                </div>
                <div className="text-right">
                    <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">{title}</div>
                    <div className="text-3xl font-bold text-navy-900">{value}</div>
                </div>
            </div>

            <div className="flex items-end justify-between mt-4">
                <div className={`flex items-center text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? (
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                    )}
                    {change}
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
