import React from 'react';

/**
 * UnitTyreDiagram.jsx
 * Visual schematic of wheel & tyre positions based on unit type.
 * Supports:
 * - DUMP TRUCK / OHT / HAULER (6 wheels: Pos 1-2 Front, Pos 3-6 Rear Duals)
 * - MOTORGRADER (6 wheels: Pos 1-2 Front, Pos 3-4 Mid, Pos 5-6 Rear Tandem)
 * - MAINHAUL (10 or 12 wheels: Axle 1 Front, Axle 2 Drive, Axle 3 Drive, Axle 4 Trailer)
 * - COMPACTOR / ROLLER (4 wheels: Pos 1-2 Front, Pos 3-4 Rear)
 * - LIGHT VEHICLE / LV (4 wheels + 1 Spare: Pos 1-4 + Pos Spare)
 * - GENERAL / TRUCK (6 or 10 wheels)
 */

export const getUnitTyreConfig = (unitType = '') => {
    const type = (unitType || '').toUpperCase().trim();

    if (type.includes('MAINHAUL') || type.includes('TRAILER') || type.includes('PRIME MOVER')) {
        return {
            typeKey: 'MAINHAUL',
            typeName: 'Mainhaul / Prime Mover (10-12 Roda)',
            totalWheels: 10,
            positions: [
                { id: 'Pos 1', name: 'Depan Kiri (FL)', side: 'L', axle: 1, axleName: 'Axle 1 (Front Steer)' },
                { id: 'Pos 2', name: 'Depan Kanan (FR)', side: 'R', axle: 1, axleName: 'Axle 1 (Front Steer)' },
                { id: 'Pos 3', name: 'Tengah Kiri Luar (RLO 1)', side: 'L', axle: 2, axleName: 'Axle 2 (Drive 1)' },
                { id: 'Pos 4', name: 'Tengah Kiri Dalam (RLI 1)', side: 'L', axle: 2, axleName: 'Axle 2 (Drive 1)' },
                { id: 'Pos 5', name: 'Tengah Kanan Dalam (RRI 1)', side: 'R', axle: 2, axleName: 'Axle 2 (Drive 1)' },
                { id: 'Pos 6', name: 'Tengah Kanan Luar (RRO 1)', side: 'R', axle: 2, axleName: 'Axle 2 (Drive 1)' },
                { id: 'Pos 7', name: 'Belakang Kiri Luar (RLO 2)', side: 'L', axle: 3, axleName: 'Axle 3 (Drive 2)' },
                { id: 'Pos 8', name: 'Belakang Kiri Dalam (RLI 2)', side: 'L', axle: 3, axleName: 'Axle 3 (Drive 2)' },
                { id: 'Pos 9', name: 'Belakang Kanan Dalam (RRI 2)', side: 'R', axle: 3, axleName: 'Axle 3 (Drive 2)' },
                { id: 'Pos 10', name: 'Belakang Kanan Luar (RRO 2)', side: 'R', axle: 3, axleName: 'Axle 3 (Drive 2)' },
            ]
        };
    }

    if (type.includes('GRADER') || type.includes('MOTORGRADER')) {
        return {
            typeKey: 'MOTORGRADER',
            typeName: 'Motor Grader (6 Roda Tandem)',
            totalWheels: 6,
            positions: [
                { id: 'Pos 1', name: 'Depan Kiri (Front Left)', side: 'L', axle: 1, axleName: 'Axle 1 (Front Steer)' },
                { id: 'Pos 2', name: 'Depan Kanan (Front Right)', side: 'R', axle: 1, axleName: 'Axle 1 (Front Steer)' },
                { id: 'Pos 3', name: 'Tengah Kiri (Mid Left)', side: 'L', axle: 2, axleName: 'Axle 2 (Tandem Mid)' },
                { id: 'Pos 4', name: 'Tengah Kanan (Mid Right)', side: 'R', axle: 2, axleName: 'Axle 2 (Tandem Mid)' },
                { id: 'Pos 5', name: 'Belakang Kiri (Rear Left)', side: 'L', axle: 3, axleName: 'Axle 3 (Tandem Rear)' },
                { id: 'Pos 6', name: 'Belakang Kanan (Rear Right)', side: 'R', axle: 3, axleName: 'Axle 3 (Tandem Rear)' },
            ]
        };
    }

    if (type.includes('COMPACTOR') || type.includes('ROLLER')) {
        return {
            typeKey: 'COMPACTOR',
            typeName: 'Compactor / Roller (4 Roda / Drum)',
            totalWheels: 4,
            positions: [
                { id: 'Pos 1', name: 'Depan Kiri (Front Left)', side: 'L', axle: 1, axleName: 'Axle 1 (Front)' },
                { id: 'Pos 2', name: 'Depan Kanan (Front Right)', side: 'R', axle: 1, axleName: 'Axle 1 (Front)' },
                { id: 'Pos 3', name: 'Belakang Kiri (Pneumatic Rear Left)', side: 'L', axle: 2, axleName: 'Axle 2 (Rear)' },
                { id: 'Pos 4', name: 'Belakang Kanan (Pneumatic Rear Right)', side: 'R', axle: 2, axleName: 'Axle 2 (Rear)' },
            ]
        };
    }

    if (type.includes('LV') || type.includes('LIGHT VEHICLE') || type.includes('TRITON') || type.includes('HILUX')) {
        return {
            typeKey: 'LV',
            typeName: 'Light Vehicle / 4x4 (4 Roda + Serep)',
            totalWheels: 5,
            positions: [
                { id: 'Pos 1', name: 'Depan Kiri (Front Left)', side: 'L', axle: 1, axleName: 'Axle 1 (Front)' },
                { id: 'Pos 2', name: 'Depan Kanan (Front Right)', side: 'R', axle: 1, axleName: 'Axle 1 (Front)' },
                { id: 'Pos 3', name: 'Belakang Kiri (Rear Left)', side: 'L', axle: 2, axleName: 'Axle 2 (Rear)' },
                { id: 'Pos 4', name: 'Belakang Kanan (Rear Right)', side: 'R', axle: 2, axleName: 'Axle 2 (Rear)' },
                { id: 'Pos Spare', name: 'Ban Cadangan (Spare)', side: 'C', axle: 3, axleName: 'Spare Tyre' },
            ]
        };
    }

    if (type.includes('FUEL') || type.includes('WATER') || type.includes('LUBE') || type.includes('CRANE') || type.includes('BIS')) {
        return {
            typeKey: 'TRUCK_10',
            typeName: 'Truck Tronton / Support (10 Roda)',
            totalWheels: 10,
            positions: [
                { id: 'Pos 1', name: 'Depan Kiri (FL)', side: 'L', axle: 1, axleName: 'Axle 1 (Front Steer)' },
                { id: 'Pos 2', name: 'Depan Kanan (FR)', side: 'R', axle: 1, axleName: 'Axle 1 (Front Steer)' },
                { id: 'Pos 3', name: 'G1 Kiri Luar (RLO 1)', side: 'L', axle: 2, axleName: 'Axle 2 (Drive 1)' },
                { id: 'Pos 4', name: 'G1 Kiri Dalam (RLI 1)', side: 'L', axle: 2, axleName: 'Axle 2 (Drive 1)' },
                { id: 'Pos 5', name: 'G1 Kanan Dalam (RRI 1)', side: 'R', axle: 2, axleName: 'Axle 2 (Drive 1)' },
                { id: 'Pos 6', name: 'G1 Kanan Luar (RRO 1)', side: 'R', axle: 2, axleName: 'Axle 2 (Drive 1)' },
                { id: 'Pos 7', name: 'G2 Kiri Luar (RLO 2)', side: 'L', axle: 3, axleName: 'Axle 3 (Drive 2)' },
                { id: 'Pos 8', name: 'G2 Kiri Dalam (RLI 2)', side: 'L', axle: 3, axleName: 'Axle 3 (Drive 2)' },
                { id: 'Pos 9', name: 'G2 Kanan Dalam (RRI 2)', side: 'R', axle: 3, axleName: 'Axle 3 (Drive 2)' },
                { id: 'Pos 10', name: 'G2 Kanan Luar (RRO 2)', side: 'R', axle: 3, axleName: 'Axle 3 (Drive 2)' },
            ]
        };
    }

    // Default: DUMP TRUCK / OHT (6 wheels)
    return {
        typeKey: 'DUMP TRUCK',
        typeName: 'Dump Truck / OHT (6 Roda Standar)',
        totalWheels: 6,
        positions: [
            { id: 'Pos 1', name: 'Depan Kiri (Front Left - FL)', side: 'L', axle: 1, axleName: 'Axle 1 (Front Steer)' },
            { id: 'Pos 2', name: 'Depan Kanan (Front Right - FR)', side: 'R', axle: 1, axleName: 'Axle 1 (Front Steer)' },
            { id: 'Pos 3', name: 'Belakang Kiri Luar (Rear Left Outer - RLO)', side: 'L', axle: 2, axleName: 'Axle 2 (Rear Duals)' },
            { id: 'Pos 4', name: 'Belakang Kiri Dalam (Rear Left Inner - RLI)', side: 'L', axle: 2, axleName: 'Axle 2 (Rear Duals)' },
            { id: 'Pos 5', name: 'Belakang Kanan Dalam (Rear Right Inner - RRI)', side: 'R', axle: 2, axleName: 'Axle 2 (Rear Duals)' },
            { id: 'Pos 6', name: 'Belakang Kanan Luar (Rear Right Outer - RRO)', side: 'R', axle: 2, axleName: 'Axle 2 (Rear Duals)' },
        ]
    };
};

export default function UnitTyreDiagram({
    unit,
    existingTyres = {},
    pendingTyres = {},
    selectedPos = null,
    onSelectPos = () => {},
    interactive = true
}) {
    if (!unit) {
        return (
            <div className="p-8 text-center text-gray-400 bg-gray-50 border-2 border-dashed rounded-xl">
                Pilih unit terlebih dahulu untuk melihat tata letak posisi roda.
            </div>
        );
    }

    const config = getUnitTyreConfig(unit.type_unit);
    const positions = config.positions;

    // Group positions by axle
    const axles = [];
    positions.forEach((pos) => {
        if (!axles[pos.axle]) {
            axles[pos.axle] = { name: pos.axleName, slots: [] };
        }
        axles[pos.axle].slots.push(pos);
    });

    const renderWheelSlot = (posDef) => {
        const existing = existingTyres[posDef.id];
        const pending = pendingTyres[posDef.id];
        const isSelected = selectedPos === posDef.id;

        const isFilled = Boolean(pending?.serial_number || existing?.serial_number);
        const serial = pending?.serial_number || existing?.serial_number;
        const brand = pending?.brand || existing?.brand;
        const size = pending?.type_size || existing?.type_size;

        return (
            <div
                key={posDef.id}
                onClick={() => interactive && onSelectPos(posDef.id)}
                className={`relative flex flex-col items-center justify-between p-3 rounded-xl border-2 transition-all cursor-pointer select-none ${
                    isSelected
                        ? 'border-blue-600 bg-blue-50/80 shadow-md ring-2 ring-blue-500/40 scale-[1.03]'
                        : isFilled
                        ? 'border-emerald-500/80 bg-emerald-50/60 hover:border-emerald-600 hover:shadow'
                        : 'border-dashed border-gray-300 bg-white hover:border-blue-400 hover:bg-gray-50'
                }`}
                style={{ minWidth: '130px' }}
            >
                {/* Visual Wheel Badge */}
                <div className="flex items-center justify-between w-full mb-1">
                    <span className={`text-[11px] font-black px-2 py-0.5 rounded-md font-mono ${
                        isSelected
                            ? 'bg-blue-600 text-white'
                            : isFilled
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-200 text-gray-700'
                    }`}>
                        {posDef.id}
                    </span>
                    {isFilled ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                            {pending?.serial_number ? 'Baru' : 'Aktif'}
                        </span>
                    ) : (
                        <span className="text-[10px] font-semibold text-gray-400">
                            Kosong
                        </span>
                    )}
                </div>

                {/* Tyre Graphic Icon */}
                <div className="my-1.5 flex items-center justify-center">
                    <div className={`w-10 h-16 rounded-lg border-2 flex items-center justify-center transition-all ${
                        isSelected
                            ? 'bg-blue-900 border-blue-500 shadow-inner'
                            : isFilled
                            ? 'bg-gray-900 border-emerald-500'
                            : 'bg-gray-100 border-gray-300 border-dashed'
                    }`}>
                        <div className="w-1.5 h-12 bg-white/20 rounded-full"></div>
                    </div>
                </div>

                {/* Wheel Info */}
                <div className="text-center w-full mt-1">
                    {serial ? (
                        <>
                            <div className="text-xs font-black text-gray-900 font-mono truncate max-w-[120px] mx-auto" title={serial}>
                                {serial}
                            </div>
                            <div className="text-[10px] text-gray-500 truncate">
                                {brand || '-'} {size ? `• ${size}` : ''}
                            </div>
                        </>
                    ) : (
                        <div className="text-[11px] font-semibold text-gray-400">
                            + Klik Input
                        </div>
                    )}
                </div>

                {/* Subtitle location */}
                <div className="text-[9px] text-gray-400 mt-1 font-medium text-center truncate w-full" title={posDef.name}>
                    {posDef.name.replace(/Pos \d+ \(/, '').replace(/\)/, '')}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-slate-900/5 border border-slate-200 rounded-2xl p-4 md:p-6">
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-200">
                <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                    <div>
                        <h4 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
                            Skematik Roda: {unit.code_unit} ({config.typeName})
                        </h4>
                        <p className="text-xs text-gray-500">
                            Tipe Unit: <span className="font-semibold text-gray-700">{unit.type_unit || 'DUMP TRUCK'}</span> • Total Posisi: <span className="font-bold text-blue-600">{config.totalWheels} Roda</span> • HM Unit: <span className="font-mono font-bold text-gray-800">{unit.hm || 0} HM</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                        <span className="text-gray-600 font-medium">Terisi / Baru</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full border border-dashed border-gray-400 bg-white"></span>
                        <span className="text-gray-500 font-medium">Kosong</span>
                    </div>
                </div>
            </div>

            {/* Visual Chassis Canvas */}
            <div className="relative max-w-4xl mx-auto py-4">
                {/* Front Indicator */}
                <div className="text-center mb-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-blue-700 bg-blue-100/80 px-3 py-1 rounded-full border border-blue-200">
                        ▲ DEPAN / FRONT CABIN
                    </span>
                </div>

                {/* Central Chassis Backbone Line */}
                <div className="space-y-6 relative">
                    {/* Background Chassis Line */}
                    <div className="absolute left-1/2 top-4 bottom-4 -translate-x-1/2 w-4 bg-gray-200/80 rounded-full -z-0"></div>

                    {/* Axles Layout */}
                    {Object.keys(axles).map((axleIndex) => {
                        const axle = axles[axleIndex];
                        const leftSlots = axle.slots.filter((s) => s.side === 'L');
                        const rightSlots = axle.slots.filter((s) => s.side === 'R');
                        const centerSlots = axle.slots.filter((s) => s.side === 'C');

                        return (
                            <div key={axleIndex} className="relative z-10 bg-white/80 border border-gray-200/80 rounded-xl p-3 shadow-sm backdrop-blur">
                                <div className="text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                                    {axle.name}
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    {/* Left Wheels */}
                                    <div className="flex items-center gap-2 justify-start flex-1">
                                        {leftSlots.map(renderWheelSlot)}
                                    </div>

                                    {/* Axle Center Bridge */}
                                    <div className="flex-shrink-0 flex items-center justify-center px-2">
                                        <div className="w-10 h-3 bg-gray-400 rounded-sm"></div>
                                    </div>

                                    {/* Right Wheels */}
                                    <div className="flex items-center gap-2 justify-end flex-1">
                                        {rightSlots.map(renderWheelSlot)}
                                    </div>
                                </div>

                                {/* Center Slots (e.g. Spare) */}
                                {centerSlots.length > 0 && (
                                    <div className="mt-3 pt-2 border-t border-dashed flex justify-center">
                                        {centerSlots.map(renderWheelSlot)}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Rear Indicator */}
                <div className="text-center mt-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-300">
                        ▼ BELAKANG / REAR
                    </span>
                </div>
            </div>
        </div>
    );
}
