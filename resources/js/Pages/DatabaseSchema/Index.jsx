import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  getBezierPath
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';

const neonThemes = [
    { border: 'border-emerald-400', shadow: 'shadow-[0_0_20px_rgba(52,211,153,0.3)]', text: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { border: 'border-blue-400', shadow: 'shadow-[0_0_20px_rgba(96,165,250,0.3)]', text: 'text-blue-400', bg: 'bg-blue-400/10' },
    { border: 'border-purple-400', shadow: 'shadow-[0_0_20px_rgba(192,132,252,0.3)]', text: 'text-purple-400', bg: 'bg-purple-400/10' },
    { border: 'border-orange-400', shadow: 'shadow-[0_0_20px_rgba(251,146,60,0.3)]', text: 'text-orange-400', bg: 'bg-orange-400/10' },
    { border: 'border-pink-400', shadow: 'shadow-[0_0_20px_rgba(244,114,182,0.3)]', text: 'text-pink-400', bg: 'bg-pink-400/10' },
    { border: 'border-cyan-400', shadow: 'shadow-[0_0_20px_rgba(34,211,238,0.3)]', text: 'text-cyan-400', bg: 'bg-cyan-400/10' },
];

const TableNode = ({ data }) => {
    // Pick a consistent theme based on the label length to randomize colors
    const theme = neonThemes[data.label.length % neonThemes.length];

    return (
        <div className={`bg-[#060b14] border-2 rounded-2xl w-64 h-24 flex items-center p-4 transition-transform hover:scale-105 cursor-pointer ${theme.border} ${theme.shadow}`}>
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-slate-300 border-none rounded-full" />
            
            <div className={`w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-xl ${theme.bg} ${theme.text}`}>
                <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                    <path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
            </div>
            
            <div className="ml-4 flex flex-col justify-center overflow-hidden">
                <span className="font-bold text-lg text-white font-sans tracking-wide truncate block">{data.label}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">Database Table</span>
            </div>

            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-slate-300 border-none rounded-full" />
        </div>
    );
};

const LightningEdge = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
}) => {
    const [edgePath] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    return (
        <>
            {/* The base track line (Garis menuju tujuan) */}
            <BaseEdge 
                path={edgePath} 
                markerEnd={markerEnd}
                style={{ stroke: '#334155', strokeWidth: 1.5, strokeOpacity: 0.8 }} 
            />
            {/* The flowing energy pulse (Animasi mengalir) */}
            <BaseEdge 
                path={edgePath} 
                pathLength="100"
                style={{ 
                    stroke: '#facc15', // Bright Yellow
                    strokeWidth: 3, 
                    filter: 'drop-shadow(0 0 6px #fde047) drop-shadow(0 0 12px #facc15)',
                    strokeLinecap: 'round'
                }} 
                className="lightning-pulse"
            />
        </>
    );
};

const nodeTypes = {
    table: TableNode,
};

const edgeTypes = {
    energy: LightningEdge, // Keep 'energy' name but use LightningEdge
};

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({ rankdir: direction, ranksep: 100, nodesep: 150 });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: 256, height: 96 });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        
        node.position = {
            x: nodeWithPosition.x - 256 / 2,
            y: nodeWithPosition.y - 96 / 2,
        };
    });

    return { nodes, edges };
};

export default function Index() {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/database-schema')
            .then(res => res.json())
            .then(data => {
                const initialNodes = data.nodes.map(n => ({
                    id: n.id,
                    type: 'table',
                    data: { label: n.name, columns: n.columns },
                    position: { x: 0, y: 0 }, 
                }));

                const initialEdges = data.links.map((link, idx) => ({
                    id: `e-${link.source}-${link.target}-${idx}`,
                    source: link.source,
                    target: link.target,
                    type: 'energy', // Custom edge type
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: '#334155',
                    },
                }));

                const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges);

                // Check if user has saved custom positions in localStorage
                const savedPositionsRaw = localStorage.getItem('db_schema_positions');
                if (savedPositionsRaw) {
                    try {
                        const savedPositions = JSON.parse(savedPositionsRaw);
                        layoutedNodes.forEach(node => {
                            if (savedPositions[node.id]) {
                                node.position = savedPositions[node.id];
                            }
                        });
                    } catch (e) {
                        console.error('Failed to parse saved positions', e);
                    }
                }

                setNodes(layoutedNodes);
                setEdges(layoutedEdges);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch schema', err);
                setLoading(false);
            });
    }, []);

    return (
        <AuthenticatedLayout header="Database Relasi">
            <Head title="Database Relasi Workflow" />

            {/* A very dark starry/dotted background similar to the image */}
            <div className="bg-[#0b101e] rounded-xl overflow-hidden shadow-2xl relative border-0" style={{ height: 'calc(100vh - 180px)' }}>
                
                {/* Control Panel for Layout */}
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                    <button 
                        onClick={() => {
                            const positions = {};
                            nodes.forEach(n => {
                                positions[n.id] = n.position;
                            });
                            localStorage.setItem('db_schema_positions', JSON.stringify(positions));
                            alert('Posisi layout berhasil disimpan di browser!');
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-bold flex items-center gap-2 transition"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
                        Simpan Posisi
                    </button>
                    <button 
                        onClick={() => {
                            if(confirm('Reset semua posisi kembali ke default?')) {
                                localStorage.removeItem('db_schema_positions');
                                window.location.reload();
                            }
                        }}
                        className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-bold flex items-center gap-2 transition"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                        Reset
                    </button>
                </div>

                {/* Subtle glowing orb in the background center */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center z-10 text-white flex-col gap-4">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="animate-pulse text-sm text-blue-400">Loading Workflow...</p>
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
                        minZoom={0.1}
                        attributionPosition="bottom-right"
                        className="dark-theme-flow"
                    >
                        <Background color="#1e293b" gap={30} size={2} />
                        <Controls className="bg-slate-800 border-slate-700 fill-white text-white" />
                        <MiniMap 
                            nodeColor={(node) => '#1e293b'} 
                            maskColor="rgba(11, 16, 30, 0.8)" 
                            className="bg-[#060b14] border border-slate-800 rounded-lg overflow-hidden" 
                        />
                    </ReactFlow>
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

                /* Lightning Animation Effects */
                path.lightning-pulse {
                    stroke-dasharray: 12 88; /* Pulse takes 12% of the line, gap is 88% */
                    animation: flow-pulse 3s linear infinite;
                }
                
                @keyframes flow-pulse {
                    from { stroke-dashoffset: 100; }
                    to { stroke-dashoffset: 0; }
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
