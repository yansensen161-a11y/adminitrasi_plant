import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    Handle,
    Position,
    MarkerType,
    BaseEdge,
    getBezierPath,
    ReactFlowProvider,
    useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { jsPDF } from 'jspdf';
import {
    Search,
    Database,
    Truck,
    Wrench,
    ShieldCheck,
    Hammer,
    Users,
    Cpu,
    RotateCcw,
    Save,
    X,
    ExternalLink,
    ArrowRight,
    Key,
    Layers,
    Filter,
    CheckCircle2,
    Eye,
    EyeOff,
    Info,
    Sparkles,
    FileDown,
    FileText,
    Image,
    ChevronDown,
    Loader2,
    Printer,
    ScrollText,
    Play,
    Video,
} from 'lucide-react';
import PresentationOverlay from './Presentation/PresentationOverlay';
import { RelationshipDefs, EdgeParticle } from './Presentation/RelationshipAnimator';
import Futuristic3DEnvironment from './Presentation/Futuristic3DEnvironment';

const CATEGORY_CONFIG = {
    fleet: {
        label: 'Fleet & Asset',
        icon: Truck,
        color: '#10b981',
        border: 'border-emerald-500/70',
        activeBorder: 'border-emerald-400',
        shadow: 'shadow-[0_0_20px_rgba(16,185,129,0.25)]',
        badgeBg: 'bg-emerald-500/15',
        badgeText: 'text-emerald-300 border-emerald-500/30',
        iconBg: 'bg-emerald-500/20 text-emerald-400',
        lineColor: '#10b981',
    },
    work_order: {
        label: 'Work Order & Perbaikan',
        icon: Wrench,
        color: '#0ea5e9',
        border: 'border-sky-500/70',
        activeBorder: 'border-sky-400',
        shadow: 'shadow-[0_0_20px_rgba(14,165,233,0.25)]',
        badgeBg: 'bg-sky-500/15',
        badgeText: 'text-sky-300 border-sky-500/30',
        iconBg: 'bg-sky-500/20 text-sky-400',
        lineColor: '#0ea5e9',
    },
    inspection: {
        label: 'Inspeksi & Kualitas',
        icon: ShieldCheck,
        color: '#f59e0b',
        border: 'border-amber-500/70',
        activeBorder: 'border-amber-400',
        shadow: 'shadow-[0_0_20px_rgba(245,158,11,0.25)]',
        badgeBg: 'bg-amber-500/15',
        badgeText: 'text-amber-300 border-amber-500/30',
        iconBg: 'bg-amber-500/20 text-amber-400',
        lineColor: '#f59e0b',
    },
    tool: {
        label: 'Tools & Workshop',
        icon: Hammer,
        color: '#a855f7',
        border: 'border-purple-500/70',
        activeBorder: 'border-purple-400',
        shadow: 'shadow-[0_0_20px_rgba(168,85,247,0.25)]',
        badgeBg: 'bg-purple-500/15',
        badgeText: 'text-purple-300 border-purple-500/30',
        iconBg: 'bg-purple-500/20 text-purple-400',
        lineColor: '#a855f7',
    },
    user: {
        label: 'User & Hak Akses',
        icon: Users,
        color: '#f43f5e',
        border: 'border-rose-500/70',
        activeBorder: 'border-rose-400',
        shadow: 'shadow-[0_0_20px_rgba(244,63,94,0.25)]',
        badgeBg: 'bg-rose-500/15',
        badgeText: 'text-rose-300 border-rose-500/30',
        iconBg: 'bg-rose-500/20 text-rose-400',
        lineColor: '#f43f5e',
    },
    system: {
        label: 'Tabel Sistem',
        icon: Cpu,
        color: '#64748b',
        border: 'border-slate-600/70',
        activeBorder: 'border-slate-400',
        shadow: 'shadow-[0_0_15px_rgba(100,116,139,0.2)]',
        badgeBg: 'bg-slate-800',
        badgeText: 'text-slate-300 border-slate-700',
        iconBg: 'bg-slate-800 text-slate-400',
        lineColor: '#64748b',
    },
};

// Custom Node Component
const TableNode = ({ data, selected }) => {
    const config = CATEGORY_CONFIG[data.category] || CATEGORY_CONFIG.system;
    const IconComponent = config.icon;
    const isHighlighted = data.isHighlighted;
    const isDimmed = data.isDimmed;
    const isPresentationFocus = data.isPresentationFocus;

    return (
        <div
            onClick={() => data.onSelect(data)}
            className={`w-72 bg-[#090e1c] border-2 rounded-2xl p-4 transition-all duration-300 cursor-pointer select-none relative group ${
                isPresentationFocus
                    ? 'border-cyan-400 shadow-[0_0_35px_rgba(56,189,248,0.7)] scale-[1.08] ring-4 ring-cyan-400/50 z-30'
                    : selected || isHighlighted
                    ? `${config.activeBorder} ${config.shadow} scale-[1.03] ring-2 ring-white/20`
                    : `${config.border} hover:scale-[1.02] hover:border-slate-400 hover:shadow-lg`
            } ${isDimmed ? 'opacity-20 grayscale-[60%] blur-[0.4px] pointer-events-none' : 'opacity-100'}`}
        >
            {/* Top Handle (Target) */}
            <Handle
                type="target"
                position={Position.Top}
                className="!w-3.5 !h-3.5 !bg-slate-300 !border-2 !border-[#090e1c] !-top-2 !rounded-full transition-transform hover:scale-125"
            />
            {/* Left Handle (Target) */}
            <Handle
                type="target"
                position={Position.Left}
                id="target-left"
                className="!w-3 !h-3 !bg-slate-400 !border-2 !border-[#090e1c] !-left-1.5 !rounded-full opacity-60"
            />

            {/* Header: Icon, Category Badge & Row Count */}
            <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${config.iconBg}`}>
                        <IconComponent className="w-4 h-4" />
                    </div>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${config.badgeBg} ${config.badgeText}`}>
                        {data.categoryLabel || config.label}
                    </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/60">
                    {Number(data.rowCount || 0).toLocaleString()} rows
                </span>
            </div>

            {/* Table Name & Label */}
            <div className="mb-2.5">
                <div className="font-bold text-white text-base tracking-wide truncate group-hover:text-blue-300 transition-colors">
                    {data.label || data.name}
                </div>
                <div className="font-mono text-xs text-slate-400 truncate">
                    {data.name}
                </div>
            </div>

            {/* Bottom Bar: Columns Count & Relation Badge */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-300">
                    <Database className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[11px] text-slate-400">{data.columns?.length || 0} kolom</span>
                </div>

                <div className="flex items-center gap-1">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-300 border border-blue-500/30">
                        ⚡ {data.connectionCount || 0} Relasi
                    </span>
                </div>
            </div>

            {/* Quick Preview of PK & FK columns */}
            {data.fkColumns?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                    {data.fkColumns.slice(0, 2).map((col, idx) => (
                        <span key={idx} className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 truncate max-w-[120px]">
                            FK: {col}
                        </span>
                    ))}
                    {data.fkColumns.length > 2 && (
                        <span className="text-[10px] font-mono text-slate-400 px-1">
                            +{data.fkColumns.length - 2}
                        </span>
                    )}
                </div>
            )}

            {/* Right Handle (Source) */}
            <Handle
                type="source"
                position={Position.Right}
                id="source-right"
                className="!w-3 !h-3 !bg-amber-400 !border-2 !border-[#090e1c] !-right-1.5 !rounded-full opacity-60"
            />
            {/* Bottom Handle (Source) */}
            <Handle
                type="source"
                position={Position.Bottom}
                className="!w-3.5 !h-3.5 !bg-amber-400 !border-2 !border-[#090e1c] !-bottom-2 !rounded-full transition-transform hover:scale-125"
            />
        </div>
    );
};

// Custom Edge Component
const SchemaEdge = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    data = {},
}) => {
    const [edgePath] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const isHighlighted = data.isHighlighted;
    const isDimmed = data.isDimmed;
    const isPresentationActive = data.isPresentationActive;
    const relType = data.type || 'database_fk';

    // Edge color based on relation type
    let strokeColor = '#38bdf8'; // database FK (cyan)
    if (relType === 'eloquent') {
        strokeColor = '#34d399'; // eloquent (emerald)
    } else if (relType === 'logical') {
        strokeColor = '#fbbf24'; // logical / domain (amber)
    }

    const isDashed = relType === 'logical';

    return (
        <>
            {/* Base track line */}
            <BaseEdge
                path={edgePath}
                markerEnd={markerEnd}
                style={{
                    stroke: isPresentationActive ? '#38bdf8' : strokeColor,
                    strokeWidth: isPresentationActive ? 4 : isHighlighted ? 3 : 1.8,
                    strokeOpacity: isDimmed ? 0.1 : isPresentationActive ? 1 : isHighlighted ? 1 : 0.65,
                    strokeDasharray: isDashed && !isPresentationActive ? '6 4' : undefined,
                    transition: 'stroke-opacity 0.3s, stroke-width 0.3s',
                    filter: isPresentationActive ? 'url(#presentation-glow)' : undefined,
                }}
            />

            {/* Moving particle along path when active in presentation */}
            {isPresentationActive && (
                <EdgeParticle edgePath={edgePath} color={strokeColor} duration={1.6} />
            )}

            {/* Animated glow pulse when highlighted in normal editor */}
            {isHighlighted && !isPresentationActive && (
                <BaseEdge
                    path={edgePath}
                    pathLength="100"
                    style={{
                        stroke: '#ffffff',
                        strokeWidth: 4,
                        filter: `drop-shadow(0 0 8px ${strokeColor})`,
                        strokeLinecap: 'round',
                    }}
                    className="edge-pulse"
                />
            )}
        </>
    );
};

const nodeTypes = {
    table: TableNode,
};

const edgeTypes = {
    schema: SchemaEdge,
};

// Dagre Layout computation
const getLayoutedElements = (nodes, edges, direction = 'TB') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({
        rankdir: direction,
        ranksep: direction === 'TB' ? 140 : 180,
        nodesep: direction === 'TB' ? 120 : 100,
    });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: 288, height: 110 });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        if (!nodeWithPosition) {
            return node;
        }

        return {
            ...node,
            position: {
                x: nodeWithPosition.x - 288 / 2,
                y: nodeWithPosition.y - 110 / 2,
            },
        };
    });

    return { nodes: layoutedNodes, edges };
};

// Flow Inner Canvas with full controls & ReactFlow context
function SchemaCanvas({ isPresentationMode: propIsPresentationMode, setIsPresentationMode: propSetIsPresentationMode }) {
    const { fitView, setCenter } = useReactFlow();

    const [allNodes, setAllNodes] = useState([]);
    const [allEdges, setAllEdges] = useState([]);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

    // Filters & Navigation state
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [hideSystem, setHideSystem] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [layoutDirection, setLayoutDirection] = useState('TB');

    // Drawer state
    const [selectedTable, setSelectedTable] = useState(null);
    const [highlightedTableId, setHighlightedTableId] = useState(null);

    // Presentation Mode state
    const [localIsPresentationMode, setLocalIsPresentationMode] = useState(false);
    const isPresentationMode = propIsPresentationMode !== undefined ? propIsPresentationMode : localIsPresentationMode;
    const setIsPresentationMode = propSetIsPresentationMode || setLocalIsPresentationMode;
    const [presentationFocusedTableId, setPresentationFocusedTableId] = useState(null);
    const [presentationActiveEdgeId, setPresentationActiveEdgeId] = useState(null);
    const [presentationHighlightedNodeIds, setPresentationHighlightedNodeIds] = useState([]);
    const containerRef = useRef(null);

    // 3D Cinematic Futuristic Environment State
    const [show3DEnvironment, setShow3DEnvironment] = useState(false);

    const schema3DData = useMemo(() => {
        if (!allNodes || !allNodes.length) return null;
        return {
            nodes: allNodes.map((n) => ({
                id: n.id,
                name: n.data?.name || n.id,
                label: n.data?.label || n.data?.name || n.id,
                category: n.data?.category,
                categoryLabel: n.data?.categoryLabel,
                columns: n.data?.columns,
                row_count: n.data?.rowCount,
                pk_columns: n.data?.pkColumns,
                fk_columns: n.data?.fkColumns,
            })),
            links: allEdges.map((e) => ({
                id: e.id,
                source: e.source,
                target: e.target,
                type: e.data?.type || 'foreign_key',
                sourceCol: e.data?.sourceCol,
                targetCol: e.data?.targetCol,
            })),
        };
    }, [allNodes, allEdges]);

    const handleUpdatePresentationHighlights = useCallback((tableId, edgeId, nodeIds = []) => {
        setPresentationFocusedTableId(tableId);
        setPresentationActiveEdgeId(edgeId);
        setPresentationHighlightedNodeIds(nodeIds || []);
    }, []);

    const handleExitPresentation = useCallback(() => {
        setIsPresentationMode(false);
        setPresentationFocusedTableId(null);
        setPresentationActiveEdgeId(null);
        setPresentationHighlightedNodeIds([]);
        setTimeout(() => {
            fitView({ padding: 0.15, duration: 800 });
        }, 80);
    }, [fitView]);

    // PDF Export state
    const [showPdfMenu, setShowPdfMenu] = useState(false);
    const [isExportingVisual, setIsExportingVisual] = useState(false);
    const pdfMenuRef = useRef(null);

    // Close PDF dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (pdfMenuRef.current && !pdfMenuRef.current.contains(e.target)) {
                setShowPdfMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Export Official PDF Document (DomPDF backend)
    const handleDownloadDocPdf = () => {
        setShowPdfMenu(false);
        const url = `/database-schema/pdf?hide_system=${hideSystem ? 1 : 0}&category=${selectedCategory}`;
        window.open(url, '_blank');
    };

    // Canvas 2D High-Resolution Diagram Generator (Zero external CSS dependency)
    const renderDiagramToCanvas = (visibleNodes, visibleEdges) => {
        if (!visibleNodes || !visibleNodes.length) {
            return null;
        }

        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        visibleNodes.forEach((node) => {
            minX = Math.min(minX, node.position.x);
            minY = Math.min(minY, node.position.y);
            maxX = Math.max(maxX, node.position.x + 288);
            maxY = Math.max(maxY, node.position.y + 110);
        });

        const padding = 80;
        const width = Math.max(maxX - minX + padding * 2, 800);
        const height = Math.max(maxY - minY + padding * 2, 600);

        const canvas = document.createElement('canvas');
        const scale = 2; // High-DPI retina scale
        canvas.width = width * scale;
        canvas.height = height * scale;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return null;
        }
        ctx.scale(scale, scale);

        // Background
        ctx.fillStyle = '#070b16';
        ctx.fillRect(0, 0, width, height);

        // Grid dots
        ctx.fillStyle = '#1e293b';
        for (let x = 0; x < width; x += 32) {
            for (let y = 0; y < height; y += 32) {
                ctx.beginPath();
                ctx.arc(x, y, 1.2, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const offsetX = padding - minX;
        const offsetY = padding - minY;

        const nodeMap = new Map();
        visibleNodes.forEach((node) => {
            nodeMap.set(node.id, {
                ...node,
                drawX: node.position.x + offsetX,
                drawY: node.position.y + offsetY,
                width: 288,
                height: 110,
            });
        });

        // 1. Draw Edges with Smart Handle Connections
        visibleEdges.forEach((edge) => {
            const source = nodeMap.get(edge.source);
            const target = nodeMap.get(edge.target);
            if (!source || !target) {
                return;
            }

            let sx, sy, tx, ty;
            const dx = target.drawX - source.drawX;
            const dy = target.drawY - source.drawY;

            let isHorizontal = false;
            if (Math.abs(dx) > Math.abs(dy) * 0.9) {
                isHorizontal = true;
                if (dx >= 0) {
                    // Target is to the right of source
                    sx = source.drawX + source.width;
                    sy = source.drawY + source.height / 2;
                    tx = target.drawX;
                    ty = target.drawY + target.height / 2;
                } else {
                    // Target is to the left of source
                    sx = source.drawX;
                    sy = source.drawY + source.height / 2;
                    tx = target.drawX + target.width;
                    ty = target.drawY + target.height / 2;
                }
            } else {
                if (dy >= 0) {
                    // Target is below source
                    sx = source.drawX + source.width / 2;
                    sy = source.drawY + source.height;
                    tx = target.drawX + target.width / 2;
                    ty = target.drawY;
                } else {
                    // Target is above source
                    sx = source.drawX + source.width / 2;
                    sy = source.drawY;
                    tx = target.drawX + target.width / 2;
                    ty = target.drawY + target.height;
                }
            }

            let strokeColor = '#38bdf8'; // database FK (cyan)
            if (edge.data?.type === 'eloquent') {
                strokeColor = '#34d399'; // eloquent (emerald)
            } else if (edge.data?.type === 'logical') {
                strokeColor = '#fbbf24'; // logical (amber)
            }

            ctx.save();
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 2.4;
            ctx.globalAlpha = 0.8;

            if (edge.data?.type === 'logical') {
                ctx.setLineDash([7, 4]);
            }

            ctx.beginPath();
            ctx.moveTo(sx, sy);
            if (isHorizontal) {
                const deltaX = Math.max(Math.abs(dx) * 0.45, 35);
                ctx.bezierCurveTo(sx + (dx > 0 ? deltaX : -deltaX), sy, tx - (dx > 0 ? deltaX : -deltaX), ty, tx, ty);
            } else {
                const deltaY = Math.max(Math.abs(dy) * 0.45, 35);
                ctx.bezierCurveTo(sx, sy + (dy > 0 ? deltaY : -deltaY), tx, ty - (dy > 0 ? deltaY : -deltaY), tx, ty);
            }
            ctx.stroke();

            // Draw Arrowhead at target
            ctx.setLineDash([]);
            ctx.fillStyle = strokeColor;
            ctx.beginPath();
            const arrowSize = 6;
            if (isHorizontal) {
                const dir = dx >= 0 ? 1 : -1;
                ctx.moveTo(tx, ty);
                ctx.lineTo(tx - dir * arrowSize * 1.5, ty - arrowSize);
                ctx.lineTo(tx - dir * arrowSize * 1.5, ty + arrowSize);
            } else {
                const dir = dy >= 0 ? 1 : -1;
                ctx.moveTo(tx, ty);
                ctx.lineTo(tx - arrowSize, ty - dir * arrowSize * 1.5);
                ctx.lineTo(tx + arrowSize, ty - dir * arrowSize * 1.5);
            }
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        });

        // 2. Draw Nodes
        visibleNodes.forEach((node) => {
            const item = nodeMap.get(node.id);
            if (!item) {
                return;
            }

            const x = item.drawX;
            const y = item.drawY;
            const w = item.width;
            const h = item.height;
            const cat = item.data.category || 'system';
            const cfg = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG.system;

            ctx.save();

            // Card Drop Shadow
            ctx.shadowColor = cfg.color + '35';
            ctx.shadowBlur = 14;

            // Card Background
            ctx.fillStyle = '#090e1c';
            ctx.beginPath();
            if (typeof ctx.roundRect === 'function') {
                ctx.roundRect(x, y, w, h, 14);
            } else {
                ctx.rect(x, y, w, h);
            }
            ctx.fill();

            // Card Border
            ctx.shadowColor = 'transparent';
            ctx.strokeStyle = cfg.color + 'aa';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Header: Category Badge
            ctx.fillStyle = cfg.color + '22';
            ctx.beginPath();
            if (typeof ctx.roundRect === 'function') {
                ctx.roundRect(x + 12, y + 10, 115, 18, 5);
            } else {
                ctx.rect(x + 12, y + 10, 115, 18);
            }
            ctx.fill();

            ctx.fillStyle = cfg.color;
            ctx.font = 'bold 9px sans-serif';
            ctx.fillText((item.data.categoryLabel || cfg.label).toUpperCase(), x + 18, y + 22);

            // Header: Row count
            ctx.fillStyle = '#1e293b';
            ctx.beginPath();
            if (typeof ctx.roundRect === 'function') {
                ctx.roundRect(x + w - 76, y + 10, 64, 18, 5);
            } else {
                ctx.rect(x + w - 76, y + 10, 64, 18);
            }
            ctx.fill();

            ctx.fillStyle = '#94a3b8';
            ctx.font = '9px monospace';
            const rowText = `${Number(item.data.rowCount || 0).toLocaleString()} r`;
            ctx.fillText(rowText, x + w - 71, y + 22);

            // Body: Title
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 13px sans-serif';
            const title = item.data.label || item.data.name;
            ctx.fillText(title.length > 25 ? title.substring(0, 24) + '...' : title, x + 12, y + 48);

            // Subtitle (Table name)
            ctx.fillStyle = '#64748b';
            ctx.font = '10px monospace';
            ctx.fillText(item.data.name, x + 12, y + 64);

            // Divider
            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x + 12, y + 74);
            ctx.lineTo(x + w - 12, y + 74);
            ctx.stroke();

            // Footer: Columns & Relations
            ctx.fillStyle = '#94a3b8';
            ctx.font = '9.5px sans-serif';
            ctx.fillText(`${item.data.columns?.length || 0} Kolom`, x + 12, y + 92);

            // Relation pill
            ctx.fillStyle = '#0284c725';
            ctx.beginPath();
            if (typeof ctx.roundRect === 'function') {
                ctx.roundRect(x + w - 88, y + 80, 76, 18, 5);
            } else {
                ctx.rect(x + w - 88, y + 80, 76, 18);
            }
            ctx.fill();
            ctx.strokeStyle = '#0284c760';
            ctx.stroke();

            ctx.fillStyle = '#38bdf8';
            ctx.font = 'bold 9px sans-serif';
            ctx.fillText(`⚡ ${item.data.connectionCount || 0} Relasi`, x + w - 83, y + 92);

            // Connection Handle Dots
            ctx.fillStyle = '#cbd5e1';
            ctx.beginPath();
            ctx.arc(x + w / 2, y, 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(x + w / 2, y + h, 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        });

        return canvas;
    };

    // 1. Export Full Scale Poster PDF (All tables included at 100% scale without squashing)
    const handleDownloadPosterPdf = async () => {
        try {
            setIsExportingVisual(true);
            setShowPdfMenu(false);

            if (!filteredElements.visibleNodes.length) {
                alert('Tidak ada tabel yang dapat diekspor.');
                return;
            }

            const canvas = renderDiagramToCanvas(filteredElements.visibleNodes, filteredElements.visibleEdges);
            if (!canvas) {
                alert('Gagal menghasilkan kanvas diagram.');
                return;
            }

            const imgData = canvas.toDataURL('image/png');

            // Maintain exact proportional aspect ratio so diagram is 100% readable and never squished
            const pdfWidth = 350; // mm
            const imgAspect = canvas.height / canvas.width;
            const pdfHeight = Math.max(pdfWidth * imgAspect + 30, 250); // mm

            const pdf = new jsPDF({
                orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
                unit: 'mm',
                format: [pdfWidth, pdfHeight],
            });

            // Dark canvas background
            pdf.setFillColor(7, 11, 22);
            pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');

            // Header Banner
            pdf.setFontSize(14);
            pdf.setTextColor(14, 165, 233);
            pdf.text('SYSTEM PLANT MANAGEMENT CMMS - DIAGRAM RELASI DATABASE (ERD)', 15, 12);

            pdf.setFontSize(9);
            pdf.setTextColor(148, 163, 184);
            const dateStr = new Date().toLocaleString('id-ID');
            pdf.text(`Waktu Ekspor: ${dateStr} | Total Tabel: ${filteredElements.visibleNodes.length} (100% Terhubung) | Total Relasi: ${filteredElements.visibleEdges.length} Jalur`, 15, 18);

            // Draw full image
            pdf.addImage(imgData, 'PNG', 15, 24, pdfWidth - 30, (pdfWidth - 30) * imgAspect);

            pdf.save(`Diagram_Relasi_Database_Lengkap_${new Date().toISOString().slice(0, 10)}.pdf`);
        } catch (err) {
            console.error('Gagal mengekspor visual PDF', err);
            alert('Terjadi kesalahan saat memproses ekspor PDF: ' + (err.message || ''));
        } finally {
            setIsExportingVisual(false);
        }
    };

    // 2. Export Multi-Page A4 PDF (Sequential sliced A4 pages for standard printing)
    const handleDownloadMultiPagePdf = async () => {
        try {
            setIsExportingVisual(true);
            setShowPdfMenu(false);

            if (!filteredElements.visibleNodes.length) {
                alert('Tidak ada tabel yang dapat diekspor.');
                return;
            }

            const canvas = renderDiagramToCanvas(filteredElements.visibleNodes, filteredElements.visibleEdges);
            if (!canvas) {
                alert('Gagal menghasilkan kanvas diagram.');
                return;
            }

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            const a4Width = 210;
            const a4Height = 297;
            const margin = 10;
            const headerHeight = 18;
            const footerHeight = 12;
            const usableWidth = a4Width - margin * 2; // 190 mm
            const usableHeight = a4Height - headerHeight - footerHeight - margin; // ~257 mm

            const mmToPx = canvas.width / usableWidth;
            const sliceHeightPx = usableHeight * mmToPx;
            const totalPages = Math.ceil(canvas.height / sliceHeightPx);

            for (let page = 0; page < totalPages; page++) {
                if (page > 0) {
                    pdf.addPage('a4', 'portrait');
                }

                pdf.setFillColor(7, 11, 22);
                pdf.rect(0, 0, a4Width, a4Height, 'F');

                pdf.setFontSize(11);
                pdf.setTextColor(14, 165, 233);
                pdf.text('SYSTEM PLANT MANAGEMENT CMMS - DIAGRAM RELASI DATABASE', margin, 11);

                pdf.setFontSize(8);
                pdf.setTextColor(148, 163, 184);
                pdf.text(`Halaman ${page + 1} dari ${totalPages} • ${filteredElements.visibleNodes.length} Tabel Terhubung`, margin, 16);

                const sourceY = page * sliceHeightPx;
                const sourceHeight = Math.min(sliceHeightPx, canvas.height - sourceY);

                const sliceCanvas = document.createElement('canvas');
                sliceCanvas.width = canvas.width;
                sliceCanvas.height = sourceHeight;

                const sliceCtx = sliceCanvas.getContext('2d');
                sliceCtx.drawImage(
                    canvas,
                    0, sourceY, canvas.width, sourceHeight,
                    0, 0, canvas.width, sourceHeight
                );

                const sliceImg = sliceCanvas.toDataURL('image/png');
                const renderHeightMm = sourceHeight / mmToPx;

                pdf.addImage(sliceImg, 'PNG', margin, headerHeight + 2, usableWidth, renderHeightMm);

                pdf.setFontSize(7.5);
                pdf.setTextColor(100, 116, 139);
                pdf.text(`Plant CMMS ERD Diagram • Dicetak pada ${new Date().toLocaleString('id-ID')}`, margin, a4Height - 5);
                pdf.text(`Halaman ${page + 1} / ${totalPages}`, a4Width - margin - 22, a4Height - 5);
            }

            pdf.save(`Diagram_Relasi_Database_A4_${new Date().toISOString().slice(0, 10)}.pdf`);
        } catch (err) {
            console.error('Gagal mengekspor PDF multi-halaman', err);
            alert('Terjadi kesalahan saat memproses ekspor PDF: ' + (err.message || ''));
        } finally {
            setIsExportingVisual(false);
        }
    };

    // Fetch schema data
    useEffect(() => {
        setLoading(true);
        fetch('/api/database-schema')
            .then((res) => res.json())
            .then((data) => {
                setStats(data.stats);

                const rawNodes = data.nodes.map((n) => ({
                    id: n.id,
                    type: 'table',
                    data: {
                        name: n.name,
                        label: n.label,
                        category: n.category,
                        categoryLabel: n.category_label,
                        isSystem: n.is_system,
                        rowCount: n.row_count,
                        columns: n.columns,
                        pkColumns: n.pk_columns,
                        fkColumns: n.fk_columns,
                        connectionCount: n.connection_count,
                    },
                    position: { x: 0, y: 0 },
                }));

                const rawEdges = data.links.map((link, idx) => ({
                    id: link.id || `e-${link.source}-${link.target}-${idx}`,
                    source: link.source,
                    target: link.target,
                    type: 'schema',
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: link.type === 'eloquent' ? '#34d399' : link.type === 'logical' ? '#fbbf24' : '#38bdf8',
                        width: 14,
                        height: 14,
                    },
                    data: {
                        type: link.type,
                        sourceCol: link.sourceCol,
                        targetCol: link.targetCol,
                        label: link.label,
                        description: link.description,
                        typeLabel: link.type_label,
                    },
                }));

                // Initial layout with calculated coordinates
                const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(rawNodes, rawEdges, 'TB');

                // Check stored positions
                const savedVersion = localStorage.getItem('db_schema_layout_version');
                const savedPositionsRaw = localStorage.getItem('db_schema_positions_v3');
                if (savedVersion === 'v3.1' && savedPositionsRaw) {
                    try {
                        const savedPositions = JSON.parse(savedPositionsRaw);
                        // Check if saved positions are valid (not all collapsed at 0,0)
                        let nonZeroPositions = 0;
                        layoutedNodes.forEach((node) => {
                            const pos = savedPositions[node.id];
                            if (pos && (pos.x !== 0 || pos.y !== 0)) {
                                nonZeroPositions++;
                            }
                        });
                        if (nonZeroPositions > 3) {
                            layoutedNodes.forEach((node) => {
                                if (savedPositions[node.id]) {
                                    node.position = savedPositions[node.id];
                                }
                            });
                        } else {
                            // Stored positions were corrupted or collapsed, clean them up
                            localStorage.removeItem('db_schema_positions_v3');
                            localStorage.removeItem('db_schema_layout_version');
                        }
                    } catch (e) {
                        console.error('Failed to parse saved positions', e);
                    }
                }

                setAllNodes(layoutedNodes);
                setAllEdges(layoutedEdges);
                setNodes(layoutedNodes);
                setEdges(layoutedEdges);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Failed to fetch schema', err);
                setLoading(false);
            });
    }, []);

    // Filter nodes & edges
    const filteredElements = useMemo(() => {
        if (!allNodes.length) {
            return { visibleNodes: [], visibleEdges: [] };
        }

        let visibleNodes = allNodes.filter((node) => {
            if (hideSystem && node.data.isSystem) {
                return false;
            }
            if (selectedCategory !== 'all' && node.data.category !== selectedCategory) {
                return false;
            }
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchName = node.data.name.toLowerCase().includes(q);
                const matchLabel = node.data.label.toLowerCase().includes(q);
                if (!matchName && !matchLabel) {
                    return false;
                }
            }
            return true;
        });

        const visibleNodeIds = new Set(visibleNodes.map((n) => n.id));

        const visibleEdges = allEdges.filter(
            (edge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
        );

        return { visibleNodes, visibleEdges };
    }, [allNodes, allEdges, selectedCategory, hideSystem, searchQuery]);

    // Handle node selection / inspector
    const handleSelectNode = useCallback((nodeData) => {
        setSelectedTable(nodeData);
        setHighlightedTableId(nodeData.name);
    }, []);

    // Apply highlighting & filtering to nodes and edges
    useEffect(() => {
        if (loading || !filteredElements.visibleNodes.length) {
            return;
        }

        // Build position map to preserve valid calculated coordinates
        const positionMap = new Map();
        allNodes.forEach((n) => {
            if (n.position && typeof n.position.x === 'number' && typeof n.position.y === 'number') {
                positionMap.set(n.id, n.position);
            }
        });
        nodes.forEach((n) => {
            if (n.position && typeof n.position.x === 'number' && typeof n.position.y === 'number') {
                positionMap.set(n.id, n.position);
            }
        });

        // Branch 1: Presentation Mode Highlighting
        if (isPresentationMode) {
            const focusedId = presentationFocusedTableId;
            const activeEdgeId = presentationActiveEdgeId;
            const highlightedIds = new Set(presentationHighlightedNodeIds || []);
            if (focusedId) {
                highlightedIds.add(focusedId);
            }

            const updatedNodes = filteredElements.visibleNodes.map((node) => {
                const isFocus = focusedId === node.id;
                const isHighlighted = highlightedIds.has(node.id);
                const hasFocusOrHighlights = Boolean(focusedId || highlightedIds.size > 0);
                const isDimmed = hasFocusOrHighlights ? !isHighlighted : false;
                const nodePos = positionMap.get(node.id) || node.position;

                return {
                    ...node,
                    position: nodePos,
                    data: {
                        ...node.data,
                        onSelect: handleSelectNode,
                        isPresentationFocus: isFocus,
                        isHighlighted,
                        isDimmed,
                    },
                };
            });

            const updatedEdges = filteredElements.visibleEdges.map((edge) => {
                const isPresentationActive =
                    activeEdgeId === edge.id ||
                    (focusedId ? edge.source === focusedId || edge.target === focusedId : false);
                const isConnected = highlightedIds.has(edge.source) && highlightedIds.has(edge.target);
                const isHighlighted = isPresentationActive || isConnected;
                const isDimmed = activeEdgeId
                    ? edge.id !== activeEdgeId
                    : (focusedId || highlightedIds.size > 0)
                    ? !isHighlighted
                    : false;

                return {
                    ...edge,
                    data: {
                        ...edge.data,
                        isPresentationActive,
                        isHighlighted,
                        isDimmed,
                    },
                };
            });

            setNodes(updatedNodes);
            setEdges(updatedEdges);
            return;
        }

        // Branch 2: Normal Editor Highlighting
        const focusedId = highlightedTableId;

        // Set of connected node IDs to focused table
        const connectedNodeIds = new Set();
        if (focusedId) {
            connectedNodeIds.add(focusedId);
            allEdges.forEach((edge) => {
                if (edge.source === focusedId) {
                    connectedNodeIds.add(edge.target);
                }
                if (edge.target === focusedId) {
                    connectedNodeIds.add(edge.source);
                }
            });
        }

        const updatedNodes = filteredElements.visibleNodes.map((node) => {
            const isSelected = focusedId === node.id;
            const isConnected = connectedNodeIds.has(node.id);
            const isDimmed = focusedId ? !isConnected : false;
            const nodePos = positionMap.get(node.id) || node.position;

            return {
                ...node,
                position: nodePos,
                data: {
                    ...node.data,
                    onSelect: handleSelectNode,
                    isPresentationFocus: false,
                    isHighlighted: isConnected,
                    isDimmed,
                },
            };
        });

        const updatedEdges = filteredElements.visibleEdges.map((edge) => {
            const isConnected = focusedId ? edge.source === focusedId || edge.target === focusedId : false;
            const isDimmed = focusedId ? !isConnected : false;

            return {
                ...edge,
                data: {
                    ...edge.data,
                    isPresentationActive: false,
                    isHighlighted: isConnected,
                    isDimmed,
                },
            };
        });

        setNodes(updatedNodes);
        setEdges(updatedEdges);
    }, [
        filteredElements,
        highlightedTableId,
        handleSelectNode,
        loading,
        isPresentationMode,
        presentationFocusedTableId,
        presentationActiveEdgeId,
        presentationHighlightedNodeIds,
        allEdges,
    ]);

    // Re-run Dagre auto-layout
    const handleAutoLayout = (direction = layoutDirection) => {
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            allNodes,
            allEdges,
            direction
        );
        setAllNodes(layoutedNodes);
        setAllEdges(layoutedEdges);
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
        setTimeout(() => {
            fitView({ padding: 0.2, duration: 800 });
        }, 50);
    };

    // Save node positions
    const handleSavePositions = () => {
        const positions = {};
        nodes.forEach((n) => {
            positions[n.id] = n.position;
        });
        localStorage.setItem('db_schema_positions_v3', JSON.stringify(positions));
        localStorage.setItem('db_schema_layout_version', 'v3.1');
        alert('Posisi layout skema berhasil disimpan!');
    };

    // Reset layout
    const handleResetLayout = () => {
        if (confirm('Reset tata letak ke posisi default otomatis?')) {
            localStorage.removeItem('db_schema_positions_v3');
            localStorage.removeItem('db_schema_layout_version');
            handleAutoLayout(layoutDirection);
        }
    };

    // Jump to table node on canvas
    const handleFocusTable = (tableName) => {
        const targetNode = nodes.find((n) => n.id === tableName);
        if (targetNode) {
            setCenter(targetNode.position.x + 144, targetNode.position.y + 55, { zoom: 1.15, duration: 600 });
            const nodeData = targetNode.data;
            setSelectedTable(nodeData);
            setHighlightedTableId(tableName);
        }
    };

    // Relationships for selected table in drawer
    const selectedRelations = useMemo(() => {
        if (!selectedTable) {
            return { incoming: [], outgoing: [] };
        }
        const name = selectedTable.name;
        const incoming = allEdges
            .filter((e) => e.target === name)
            .map((e) => ({
                id: e.id,
                source: e.source,
                target: e.target,
                sourceCol: e.data.sourceCol,
                targetCol: e.data.targetCol,
                type: e.data.type,
                typeLabel: e.data.typeLabel,
                description: e.data.description,
            }));

        const outgoing = allEdges
            .filter((e) => e.source === name)
            .map((e) => ({
                id: e.id,
                source: e.source,
                target: e.target,
                sourceCol: e.data.sourceCol,
                targetCol: e.data.targetCol,
                type: e.data.type,
                typeLabel: e.data.typeLabel,
                description: e.data.description,
            }));

        return { incoming, outgoing };
    }, [selectedTable, allEdges]);

    return (
        <div
            ref={containerRef}
            className={`w-full h-full flex flex-col bg-[#070b16] transition-all duration-300 ${
                isPresentationMode
                    ? 'fixed inset-0 z-[9999] w-screen h-screen overflow-hidden'
                    : 'relative rounded-xl overflow-hidden shadow-2xl border border-slate-800'
            }`}
        >
            {/* Top Toolbar (Hidden in Presentation Mode) */}
            {!isPresentationMode && (
                <>
                    <div className="p-3 bg-[#0a0f21]/95 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 z-10 backdrop-blur">
                        {/* Left: Search & Category Pills */}
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Search Input */}
                            <div className="relative">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Cari tabel database..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg pl-9 pr-7 py-2 w-52 focus:w-64 focus:border-blue-500 focus:outline-none transition-all"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            {/* Category Filter Pills */}
                            <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800 overflow-x-auto">
                                <button
                                    onClick={() => setSelectedCategory('all')}
                                    className={`text-xs px-2.5 py-1 rounded-md font-semibold transition ${
                                        selectedCategory === 'all'
                                            ? 'bg-blue-600 text-white shadow'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                    }`}
                                >
                                    Semua ({allNodes.length})
                                </button>
                                {Object.entries(CATEGORY_CONFIG).map(([catKey, config]) => {
                                    const count = allNodes.filter((n) => n.data.category === catKey).length;
                                    const isSelected = selectedCategory === catKey;
                                    return (
                                        <button
                                            key={catKey}
                                            onClick={() => setSelectedCategory(catKey)}
                                            className={`text-xs px-2.5 py-1 rounded-md font-semibold flex items-center gap-1.5 transition whitespace-nowrap ${
                                                isSelected
                                                    ? 'bg-slate-700 text-white shadow ring-1 ring-white/20'
                                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                            }`}
                                        >
                                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }}></span>
                                            {config.label} ({count})
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right: Actions & Toggles */}
                        <div className="flex items-center gap-2">
                            {/* Hide System Toggle */}
                            <button
                                onClick={() => setHideSystem(!hideSystem)}
                                className={`text-xs px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition ${
                                    hideSystem
                                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                                }`}
                                title="Sembunyikan tabel sistem (cache, jobs, migrations, dsb.)"
                            >
                                {hideSystem ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                <span>{hideSystem ? 'Sistem Tersembunyi' : 'Tabel Sistem Aktif'}</span>
                            </button>

                            {/* Layout Direction Toggle */}
                            <button
                                onClick={() => {
                                    const newDir = layoutDirection === 'TB' ? 'LR' : 'TB';
                                    setLayoutDirection(newDir);
                                    handleAutoLayout(newDir);
                                }}
                                className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
                                title="Ubah arah layout diagram"
                            >
                                <Layers className="w-3.5 h-3.5 text-blue-400" />
                                <span>{layoutDirection === 'TB' ? 'Vertikal (TB)' : 'Horizontal (LR)'}</span>
                            </button>

                            {/* 3D Cinematic Workflow Video (30s) */}
                            <button
                                onClick={() => setShow3DEnvironment(true)}
                                className="bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs px-3.5 py-1.5 rounded-lg font-black flex items-center gap-1.5 shadow-lg shadow-cyan-950/60 ring-1 ring-cyan-400/50 hover:scale-[1.03] active:scale-95 transition-all"
                                title="Buka 3D Futuristic Environment & Rekam Video Sinematik 30 Detik"
                            >
                                <Video className="w-3.5 h-3.5 text-cyan-200 animate-pulse" />
                                <span>3D CINEMATIC (30S)</span>
                            </button>

                            {/* Presentation Mode Button */}
                            <button
                                onClick={() => setIsPresentationMode(true)}
                                className="bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 hover:from-blue-500 hover:to-cyan-400 text-white text-xs px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-950/60 ring-1 ring-cyan-400/40 hover:scale-[1.02] active:scale-95 transition-all"
                                title="Mulai Tur Arsitektur Sinematik (Keynote Style Walkthrough)"
                            >
                                <Play className="w-3.5 h-3.5 fill-white" />
                                <span>PRESENTATION MODE</span>
                            </button>

                            {/* Download PDF Dropdown Menu */}
                            <div className="relative" ref={pdfMenuRef}>
                                <button
                                    onClick={() => setShowPdfMenu(!showPdfMenu)}
                                    disabled={isExportingVisual}
                                    className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 shadow-lg shadow-emerald-900/30 transition"
                                    title="Download Laporan / Diagram PDF"
                                >
                                    {isExportingVisual ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            <span>Mengekspor...</span>
                                        </>
                                    ) : (
                                        <>
                                            <FileDown className="w-3.5 h-3.5" />
                                            <span>Download PDF</span>
                                            <ChevronDown className="w-3 h-3 opacity-70" />
                                        </>
                                    )}
                                </button>

                                {showPdfMenu && (
                                    <div className="absolute right-0 top-full mt-2 w-80 bg-[#090e1f] border border-slate-700 rounded-xl shadow-2xl z-50 p-2 divide-y divide-slate-800 animate-in fade-in zoom-in-95 duration-150">
                                        <div className="pb-1.5 space-y-1">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 block">
                                                Pilihan Ekspor PDF
                                            </span>
                                            
                                            {/* 1. Full Scale Poster PDF */}
                                            <button
                                                onClick={handleDownloadPosterPdf}
                                                className="w-full text-left p-2 rounded-lg hover:bg-slate-800/80 transition flex items-start gap-2.5 group"
                                            >
                                                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-emerald-500/30">
                                                    <ScrollText className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-semibold text-white group-hover:text-emerald-300 flex items-center gap-1.5">
                                                        <span>Diagram Utuh (Resolusi Penuh)</span>
                                                        <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-normal">Rekomendasi</span>
                                                    </div>
                                                    <div className="text-[10px] text-slate-400">
                                                        Semua {filteredElements.visibleNodes.length} tabel & {filteredElements.visibleEdges.length} relasi masuk 100% tanpa gepeng atau terpotong.
                                                    </div>
                                                </div>
                                            </button>

                                            {/* 2. Multi-Page A4 PDF */}
                                            <button
                                                onClick={handleDownloadMultiPagePdf}
                                                className="w-full text-left p-2 rounded-lg hover:bg-slate-800/80 transition flex items-start gap-2.5 group"
                                            >
                                                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-amber-500/30">
                                                    <Printer className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-semibold text-white group-hover:text-amber-300">
                                                        Diagram Siap Cetak (A4 Bersambung)
                                                    </div>
                                                    <div className="text-[10px] text-slate-400">
                                                        Diagram dipecah ke lembar A4 portrait berurutan lengkap dengan nomor halaman.
                                                    </div>
                                                </div>
                                            </button>
                                        </div>

                                        <div className="pt-1.5">
                                            {/* 3. Server-side DomPDF Dictionary */}
                                            <button
                                                onClick={handleDownloadDocPdf}
                                                className="w-full text-left p-2 rounded-lg hover:bg-slate-800/80 transition flex items-start gap-2.5 group"
                                            >
                                                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-blue-500/30">
                                                    <FileText className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-semibold text-white group-hover:text-blue-300">
                                                        Dokumen Kamus Data & Relasi
                                                    </div>
                                                    <div className="text-[10px] text-slate-400">
                                                        Laporan resmi struktur tabel, kolom, tipe data & matriks relasi lengkap.
                                                    </div>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Save Position */}
                            <button
                                onClick={handleSavePositions}
                                className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 shadow transition"
                            >
                                <Save className="w-3.5 h-3.5" />
                                <span>Simpan Posisi</span>
                            </button>

                            {/* Reset Layout */}
                            <button
                                onClick={handleResetLayout}
                                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Reset</span>
                            </button>
                        </div>
                    </div>

                    {/* Sub-Header: Connectivity & Stats Legend Bar */}
                    <div className="px-4 py-2 bg-[#0a0f21]/80 border-b border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 z-10">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                100% Tabel Terkoneksi ({filteredElements.visibleNodes.length} tabel ditampilkan)
                            </span>
                            <span className="text-slate-600">•</span>
                            <span className="text-sky-400 font-semibold">
                                ⚡ {filteredElements.visibleEdges.length} Relasi Aktif
                            </span>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1.5">
                                <span className="w-3 h-0.5 bg-sky-400 rounded-full inline-block"></span>
                                <span className="text-slate-300">Foreign Key Database</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-3 h-0.5 bg-emerald-400 rounded-full inline-block"></span>
                                <span className="text-slate-300">Relasi Eloquent Model</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-3 h-0.5 border-t border-dashed border-amber-400 inline-block"></span>
                                <span className="text-slate-300">Relasi Domain / Logikal</span>
                            </span>
                        </div>
                    </div>
                </>
            )}

            {/* Flow Container */}
            <div className="relative flex-1 w-full h-full">
                {/* SVG definitions for particle flow & glow */}
                <RelationshipDefs />

                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center z-20 text-white flex-col gap-4 bg-[#070b16]/90">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="animate-pulse text-sm text-blue-400 font-semibold">
                            Memetakan Relasi Seluruh Database Plant...
                        </p>
                    </div>
                ) : (
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        fitView
                        minZoom={0.08}
                        maxZoom={2}
                        attributionPosition="bottom-left"
                        className="dark-theme-flow"
                    >
                        <Background color="#1e293b" gap={28} size={1.5} />
                        {!isPresentationMode && (
                            <>
                                <Controls className="bg-slate-900 border border-slate-700 fill-white text-white rounded-lg shadow-xl" />
                                <MiniMap
                                    nodeColor={(n) => {
                                        const cfg = CATEGORY_CONFIG[n.data?.category] || CATEGORY_CONFIG.system;
                                        return cfg.color;
                                    }}
                                    maskColor="rgba(7, 11, 22, 0.85)"
                                    className="bg-[#050813] border border-slate-800 rounded-lg overflow-hidden shadow-2xl"
                                />
                            </>
                        )}
                    </ReactFlow>
                )}

                {/* Presentation Mode Overlay Engine */}
                <PresentationOverlay
                    isActive={isPresentationMode}
                    onExit={handleExitPresentation}
                    nodes={nodes.length > 0 ? nodes : filteredElements.visibleNodes}
                    edges={edges.length > 0 ? edges : filteredElements.visibleEdges}
                    categoryConfig={CATEGORY_CONFIG}
                    onUpdatePresentationHighlights={handleUpdatePresentationHighlights}
                    containerRef={containerRef}
                />

                {/* 3D Futuristic Cinematic Database Environment (20s Video Recording) */}
                {show3DEnvironment && (
                    <Futuristic3DEnvironment
                        schemaData={schema3DData}
                        onClose={() => setShow3DEnvironment(false)}
                    />
                )}

                {/* Table Inspector Drawer (Only in Normal Editor Mode) */}
                {selectedTable && !isPresentationMode && (
                    <div className="absolute top-0 right-0 bottom-0 w-96 bg-[#090e1f]/95 border-l border-slate-800 shadow-2xl z-30 flex flex-col backdrop-blur-md animate-in slide-in-from-right duration-200">
                        {/* Drawer Header */}
                        <div className="p-4 border-b border-slate-800 flex items-start justify-between gap-2">
                            <div>
                                <span
                                    className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border mb-1.5 inline-block"
                                    style={{
                                        borderColor: CATEGORY_CONFIG[selectedTable.category]?.color,
                                        color: CATEGORY_CONFIG[selectedTable.category]?.color,
                                        backgroundColor: `${CATEGORY_CONFIG[selectedTable.category]?.color}15`,
                                    }}
                                >
                                    {selectedTable.categoryLabel}
                                </span>
                                <h3 className="text-lg font-bold text-white tracking-wide">
                                    {selectedTable.label || selectedTable.name}
                                </h3>
                                <p className="font-mono text-xs text-slate-400">{selectedTable.name}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setSelectedTable(null);
                                    setHighlightedTableId(null);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Drawer Body */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-5">
                            {/* Summary Stats */}
                            <div className="grid grid-cols-2 gap-2">
                                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                                    <span className="text-[10px] text-slate-400 block uppercase">Jumlah Baris</span>
                                    <span className="text-base font-bold text-white font-mono">
                                        {Number(selectedTable.rowCount || 0).toLocaleString()}
                                    </span>
                                </div>
                                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                                    <span className="text-[10px] text-slate-400 block uppercase">Total Kolom</span>
                                    <span className="text-base font-bold text-blue-400 font-mono">
                                        {selectedTable.columns?.length || 0} Kolom
                                    </span>
                                </div>
                            </div>

                            {/* Incoming Relations */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <ArrowRight className="w-3.5 h-3.5 text-sky-400 rotate-180" />
                                    Relasi Masuk ({selectedRelations.incoming.length})
                                </h4>
                                {selectedRelations.incoming.length === 0 ? (
                                    <p className="text-xs text-slate-500 italic">Tidak ada relasi masuk</p>
                                ) : (
                                    <div className="space-y-1.5">
                                        {selectedRelations.incoming.map((rel, idx) => (
                                            <div
                                                key={idx}
                                                className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs hover:border-slate-700 transition"
                                            >
                                                <div>
                                                    <div className="font-semibold text-white">
                                                        {rel.source}.<span className="text-amber-400">{rel.sourceCol}</span>
                                                    </div>
                                                    <div className="text-[10px] text-slate-400">
                                                        {rel.typeLabel || 'Relasi'}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleFocusTable(rel.source)}
                                                    className="px-2 py-1 rounded bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 text-[10px] font-semibold flex items-center gap-1 transition"
                                                    title="Lihat tabel sumber"
                                                >
                                                    <span>Lihat</span>
                                                    <ExternalLink className="w-2.5 h-2.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Outgoing Relations */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                                    Relasi Keluar ({selectedRelations.outgoing.length})
                                </h4>
                                {selectedRelations.outgoing.length === 0 ? (
                                    <p className="text-xs text-slate-500 italic">Tidak ada relasi keluar</p>
                                ) : (
                                    <div className="space-y-1.5">
                                        {selectedRelations.outgoing.map((rel, idx) => (
                                            <div
                                                key={idx}
                                                className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs hover:border-slate-700 transition"
                                            >
                                                <div>
                                                    <div className="font-semibold text-white">
                                                        → {rel.target}.<span className="text-emerald-400">{rel.targetCol}</span>
                                                    </div>
                                                    <div className="text-[10px] text-slate-400">
                                                        {rel.typeLabel || 'Relasi'}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleFocusTable(rel.target)}
                                                    className="px-2 py-1 rounded bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-500/30 text-[10px] font-semibold flex items-center gap-1 transition"
                                                    title="Lihat tabel tujuan"
                                                >
                                                    <span>Lihat</span>
                                                    <ExternalLink className="w-2.5 h-2.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Column Definitions List */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <Key className="w-3.5 h-3.5 text-slate-400" />
                                    Daftar Kolom ({selectedTable.columns?.length || 0})
                                </h4>
                                <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900/60 max-h-60 overflow-y-auto divide-y divide-slate-800/80">
                                    {selectedTable.columns?.map((col, idx) => {
                                        const isPk = col.key === 'PRI';
                                        const isFk = selectedTable.fkColumns?.includes(col.name);

                                        return (
                                            <div key={idx} className="p-2 flex items-center justify-between text-xs hover:bg-slate-800/40">
                                                <div className="flex items-center gap-1.5 truncate">
                                                    <span className="font-mono text-slate-200 font-semibold truncate">
                                                        {col.name}
                                                    </span>
                                                    {isPk && (
                                                        <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-bold">
                                                            PK
                                                        </span>
                                                    )}
                                                    {isFk && (
                                                        <span className="px-1 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[9px] font-bold">
                                                            FK
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="font-mono text-[10px] text-slate-400">
                                                    {col.type}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Drawer Footer */}
                        <div className="p-3 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
                            <span className="text-[11px] text-slate-400">
                                Total {selectedRelations.incoming.length + selectedRelations.outgoing.length} Relasi
                            </span>
                            <button
                                onClick={() => handleFocusTable(selectedTable.name)}
                                className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Pusatkan Tampilan</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                /* Override React Flow Controls to match dark theme */
                .react-flow__controls-button {
                    background-color: #0f172a !important;
                    border-bottom-color: #1e293b !important;
                }
                .react-flow__controls-button svg {
                    fill: #94a3b8 !important;
                }
                .react-flow__controls-button:hover {
                    background-color: #1e293b !important;
                }

                /* Flow Pulse Animations */
                .edge-pulse {
                    stroke-dasharray: 12 88;
                    animation: edge-flow 2.5s linear infinite;
                }

                @keyframes edge-flow {
                    from { stroke-dashoffset: 100; }
                    to { stroke-dashoffset: 0; }
                }
            `}</style>
        </div>
    );
}

export default function Index() {
    const [isPresentationMode, setIsPresentationMode] = useState(false);

    return (
        <AuthenticatedLayout header={isPresentationMode ? null : "Database Relasi (Entity Relationship Diagram)"}>
            <Head title={isPresentationMode ? "Cinematic Presentation - ERD CMMS Plant" : "Database Relasi - ERD CMMS Plant"} />
            <div style={{ height: isPresentationMode ? '100vh' : 'calc(100vh - 170px)' }}>
                <ReactFlowProvider>
                    <SchemaCanvas
                        isPresentationMode={isPresentationMode}
                        setIsPresentationMode={setIsPresentationMode}
                    />
                </ReactFlowProvider>
            </div>
        </AuthenticatedLayout>
    );
}
