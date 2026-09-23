import React, { useState, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Checkbox from '@/Components/Checkbox';
import { Plus, Edit2, Trash2, Download, ZoomIn, ZoomOut, RotateCcw, UserPlus, X } from 'lucide-react';
import html2pdf from 'html2pdf.js';

export default function Index({ auth, flatNodes = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
    const [editingId, setEditingId] = useState(null);
    const [zoom, setZoom] = useState(1);
    const [isDownloading, setIsDownloading] = useState(false);

    // Form state with members array
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        jabatan: '',
        parent_id: '',
        section: '',
        order_index: 0,
        members: [{ name: '', is_vacant: false }],
    });

    // Helper map of nodes by section or ID
    const nodesMap = {};
    flatNodes.forEach(node => {
        nodesMap[node.id] = node;
        if (node.section) {
            if (!nodesMap['sec_' + node.section]) {
                nodesMap['sec_' + node.section] = [];
            }
            nodesMap['sec_' + node.section].push(node);
        }
    });

    const openCreateModal = (parentId = '', section = '') => {
        setModalMode('create');
        setEditingId(null);
        clearErrors();
        reset();
        setData({
            jabatan: '',
            name: '',
            parent_id: parentId || '',
            section: section || '',
            order_index: 0,
            is_vacant: false,
            members: [{ name: '', is_vacant: false }],
        });
        setIsModalOpen(true);
    };

    const openEditModal = (node) => {
        setModalMode('edit');
        setEditingId(node.id);
        clearErrors();

        let initialMembers = [];
        if (Array.isArray(node.members) && node.members.length > 0) {
            initialMembers = node.members.map(m => {
                const isVacant = Boolean(m.is_vacant) || m.name === 'Vacant';
                return {
                    name: isVacant ? 'Vacant' : (m.name || ''),
                    is_vacant: isVacant,
                };
            });
        } else if (node.name) {
            const isVacant = Boolean(node.is_vacant) || node.name === 'Vacant';
            initialMembers = [{ name: isVacant ? 'Vacant' : node.name, is_vacant: isVacant }];
        } else {
            const isVacant = Boolean(node.is_vacant);
            initialMembers = [{ name: isVacant ? 'Vacant' : '', is_vacant: isVacant }];
        }

        const isAllVacant = initialMembers.length > 0 && initialMembers.every(m => m.is_vacant);

        setData({
            jabatan: node.jabatan || '',
            name: node.name || '',
            parent_id: node.parent_id || '',
            section: node.section || '',
            order_index: node.order_index ?? 0,
            is_vacant: node.is_vacant ?? isAllVacant,
            members: initialMembers,
        });
        setIsModalOpen(true);
    };

    const handleAddMember = () => {
        setData('members', [...data.members, { name: '', is_vacant: false }]);
    };

    const handleRemoveMember = (idx) => {
        if (data.members.length <= 1) return;
        const newMembers = [...data.members];
        newMembers.splice(idx, 1);
        setData('members', newMembers);
    };

    const handleMemberChange = (idx, field, value) => {
        const newMembers = [...data.members];
        newMembers[idx] = { ...newMembers[idx], [field]: value };
        setData('members', newMembers);
    };

    const handleToggleVacant = (idx, forceChecked = null) => {
        const newMembers = [...data.members];
        const current = newMembers[idx] || { name: '', is_vacant: false };
        const nextVacant = forceChecked !== null ? Boolean(forceChecked) : !current.is_vacant;

        newMembers[idx] = {
            ...current,
            is_vacant: nextVacant,
            name: nextVacant ? 'Vacant' : (current.name === 'Vacant' ? '' : current.name),
        };
        setData('members', newMembers);
    };

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus posisi ini?')) {
            router.delete(route('organization.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    const submitForm = (e) => {
        e.preventDefault();

        if (modalMode === 'create') {
            post(route('organization.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        } else {
            put(route('organization.update', editingId), {
                preserveScroll: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDownloadPdf = () => {
        const element = document.getElementById('org-chart-content');
        if (!element) return;

        setIsDownloading(true);
        document.body.classList.add('exporting-pdf');

        const originalZoom = zoom;
        setZoom(1);

        setTimeout(() => {
            const opt = {
                margin:       [0.3, 0.3, 0.3, 0.3],
                filename:     'Struktur_Organisasi_Plant_Department.pdf',
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true, logging: false },
                jsPDF:        { unit: 'in', format: 'a3', orientation: 'landscape' }
            };

            html2pdf().set(opt).from(element).save().then(() => {
                document.body.classList.remove('exporting-pdf');
                setZoom(originalZoom);
                setIsDownloading(false);
            }).catch(err => {
                console.error(err);
                document.body.classList.remove('exporting-pdf');
                setZoom(originalZoom);
                setIsDownloading(false);
            });
        }, 300);
    };

    // Reusable Card Component matching PDF layout exactly
    const NodeCard = ({ node }) => {
        if (!node) return null;

        const members = Array.isArray(node.members) && node.members.length > 0
            ? node.members
            : (node.name ? [{ name: node.name, is_vacant: node.is_vacant }] : []);

        const isEntirelyVacant = node.is_vacant || (members.length > 0 && members.every(m => m.is_vacant));

        return (
            <div className="relative group inline-block text-left text-xs bg-white border border-gray-900 shadow-sm rounded-none w-full min-w-[155px] max-w-[210px] transition-all">
                {/* Hover Action Buttons */}
                <div className="absolute -top-3.5 right-0 hidden group-hover:flex items-center gap-1 z-30 bg-white border border-gray-400 rounded shadow-md px-1 py-0.5 no-export">
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); openEditModal(node); }}
                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                        title="Edit Posisi / Anggota"
                    >
                        <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); openCreateModal(node.id, node.section); }}
                        className="p-1 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded"
                        title="Tambah Subordinat"
                    >
                        <Plus className="w-3 h-3" />
                    </button>
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleDelete(node.id); }}
                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                        title="Hapus Posisi"
                    >
                        <Trash2 className="w-3 h-3" />
                    </button>
                </div>

                {/* Jabatan / Title */}
                <div className="px-2 py-1 font-bold text-[10px] tracking-tight uppercase text-center border-b border-gray-900 bg-gray-50/80 leading-snug break-words">
                    {node.jabatan}
                </div>

                {/* Personnel Rows */}
                {members.length > 0 ? (
                    <div className="divide-y divide-gray-900">
                        {members.map((m, idx) => (
                            <div
                                key={idx}
                                className={`flex items-stretch text-[9.5px] leading-tight ${
                                    m.is_vacant ? 'bg-[#00a2e8] text-white font-semibold' : 'text-gray-900 bg-white'
                                }`}
                            >
                                {members.length > 1 && (
                                    <span className={`w-4 py-0.5 text-center font-bold border-r ${m.is_vacant ? 'border-white/40' : 'border-gray-900'} shrink-0 text-[9px]`}>
                                        {idx + 1}
                                    </span>
                                )}
                                <span className="px-1.5 py-0.5 flex-1 truncate font-medium">
                                    {m.name || (m.is_vacant ? 'Vacant' : '-')}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={`px-2 py-1 text-center text-[9.5px] ${isEntirelyVacant ? 'bg-[#00a2e8] text-white font-bold' : 'text-gray-500'}`}>
                        {isEntirelyVacant ? 'Vacant' : '-'}
                    </div>
                )}
            </div>
        );
    };

    // Helper to get node by exact jabatan name
    const getNode = (jabatan) => {
        return flatNodes.find(n => n.jabatan.trim().toLowerCase() === jabatan.trim().toLowerCase());
    };

    // Specific Nodes from PDF
    const pmNode = getNode('PROJECT MANAGER');
    const plantMgrHoNode = getNode('PLANT MANAGER (HO)');
    const superintendentNode = getNode('Superintendent');

    // Col 1
    const spvPlannerNode = getNode('Supervisor Planner');
    const fmPlannerNode = getNode('Foreman Planner');
    const officePlantNode = getNode('OFFICE PLANT');
    const adminPlantNode = getNode('ADMIN PLANT');
    const toolskeeperNode = getNode('TOOLSKEEPERT & DISPACHER');

    // Col 2
    const spvPrevNode = getNode('Supervisor Preventive & Predictive maintenance');
    const inspectorNode = getNode('INSPECTOR');
    const lubecarNode = getNode('OPERATOR LUBECAR');
    const greasingNode = getNode('GREASING & AUTOLUBE');
    const washingmanNode = getNode('WASHINGMAN');
    const fmPrevNode = getNode('Foreman Preventive & Predictive maintenance');
    const serviceman1Node = getNode('SERVICEMAN I');
    const serviceman2Node = getNode('SERVICEMAN II');
    const serviceman3Node = getNode('SERVICEMAN III');
    const helperServicemanNode = getNode('HELPER SERVICEMAN');

    // Col 3
    const spvCorrNode = getNode('Supervisor Corrective Maintenance');
    const fmCorrNode = getNode('Foreman Corrective Maintenance');
    const mech1Node = getNode('MECHANIC I');
    const mech2Node = getNode('MECHANIC II');
    const mech3Node = getNode('MECHANIC III');
    const helperMechNode = getNode('HELPER MECHANIC');
    const fmWelderNode = getNode('FOREMAN WELDER');
    const welder1Node = getNode('WELDER I');
    const welder2Node = getNode('WELDER II');
    const welder3Node = getNode('WELDER III');
    const helperWelderNode = getNode('HELPER WELDER');

    // Col 4
    const spvElecNode = getNode('Supervisor Electrical');
    const fmElecNode = getNode('FOREMAN ELEKTRIK');
    const elec1Node = getNode('ELECTRIC I');
    const elec2Node = getNode('ELECTRIC II');
    const elec3Node = getNode('ELECTRIC III');

    // Col 5
    const spvTyreNode = getNode('Supervisor Tyre');
    const fmTyreNode = getNode('FOREMAN TYRE');
    const tyre1Node = getNode('TYREMAN I');
    const tyre2Node = getNode('TYREMAN II');
    const tyre3Node = getNode('TYREMAN III');
    const helperTyreNode = getNode('HELPER TYREMAN');
    const craneNode = getNode('OPERATOR CRANE');
    const riggerNode = getNode('Rigger');

    // Any extra nodes that were added custom by user (not in standard PDF layout)
    const standardJabatans = [
        'project manager', 'plant manager (ho)', 'superintendent',
        'supervisor planner', 'foreman planner', 'office plant', 'admin plant', 'toolskeepert & dispacher',
        'supervisor preventive & predictive maintenance', 'inspector', 'operator lubecar', 'greasing & autolube', 'washingman',
        'foreman preventive & predictive maintenance', 'serviceman i', 'serviceman ii', 'serviceman iii', 'helper serviceman',
        'supervisor corrective maintenance', 'foreman corrective maintenance', 'mechanic i', 'mechanic ii', 'mechanic iii', 'helper mechanic',
        'foreman welder', 'welder i', 'welder ii', 'welder iii', 'helper welder',
        'supervisor electrical', 'foreman elektrik', 'electric i', 'electric ii', 'electric iii',
        'supervisor tyre', 'foreman tyre', 'tyreman i', 'tyreman ii', 'tyreman iii', 'helper tyreman',
        'operator crane', 'rigger'
    ];
    const customNodes = flatNodes.filter(n => !standardJabatans.includes(n.jabatan.trim().toLowerCase()));

    return (
        <AuthenticatedLayout>
            <Head title="Struktur Organisasi - Plant Department" />

            <style dangerouslySetInnerHTML={{__html: `
                body.exporting-pdf .no-export {
                    display: none !important;
                }
                body.exporting-pdf .export-canvas {
                    box-shadow: none !important;
                    border: none !important;
                    background: white !important;
                    padding: 0 !important;
                }
            `}} />

            {/* Sticky Navigation & Control Bar */}
            <div className="bg-white border-b border-gray-200 px-6 py-3 flex flex-wrap justify-between items-center sticky top-0 z-40 shadow-sm gap-4 no-export">
                <div>
                    <h1 className="text-xl font-black text-gray-900 tracking-tight uppercase">
                        Struktur Organisasi Plant Department
                    </h1>
                    <p className="text-xs font-medium text-gray-500">
                        Visualisasi resmi hierarki & personil sesuai dokumen PDF fix
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {/* Zoom Controls */}
                    <div className="flex items-center bg-gray-100 rounded-lg p-1 border border-gray-200 mr-2">
                        <button
                            type="button"
                            onClick={() => setZoom(prev => Math.max(0.4, prev - 0.1))}
                            className="p-1.5 hover:bg-white text-gray-700 rounded transition"
                            title="Zoom Out"
                        >
                            <ZoomOut className="w-4 h-4" />
                        </button>
                        <span className="text-xs font-bold px-2 text-gray-600 min-w-[45px] text-center">
                            {Math.round(zoom * 100)}%
                        </span>
                        <button
                            type="button"
                            onClick={() => setZoom(prev => Math.min(1.5, prev + 0.1))}
                            className="p-1.5 hover:bg-white text-gray-700 rounded transition"
                            title="Zoom In"
                        >
                            <ZoomIn className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setZoom(1)}
                            className="p-1.5 hover:bg-white text-gray-700 rounded transition ml-1"
                            title="Reset Zoom"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <SecondaryButton
                        onClick={handleDownloadPdf}
                        disabled={isDownloading}
                        className="flex items-center gap-2 border-teal-600 text-teal-800 hover:bg-teal-50"
                    >
                        <Download className="w-4 h-4" />
                        {isDownloading ? 'Mengekspor PDF...' : 'Download PDF'}
                    </SecondaryButton>

                    <PrimaryButton
                        onClick={() => openCreateModal('', '')}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
                    >
                        <Plus className="w-4 h-4" />
                        Tambah Posisi
                    </PrimaryButton>
                </div>
            </div>

            {/* Main Canvas Area with Horizontal & Vertical Scroll */}
            <div className="bg-gray-100/90 min-h-[calc(100vh-80px)] p-6 overflow-auto flex justify-center">
                <div
                    id="org-chart-content"
                    className="export-canvas bg-white p-8 rounded-lg shadow-lg border border-gray-300 transition-transform origin-top inline-block"
                    style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
                >
                    {/* Top Title Banner */}
                    <div className="flex justify-center mb-6">
                        <div className="border border-gray-900 px-6 py-2 bg-white text-center shadow-xs">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                                Organization Structure- Plant Department
                            </h2>
                        </div>
                    </div>

                    {/* TOP SECTION: Project Manager & Superintendent */}
                    <div className="relative flex flex-col items-center mb-0">
                        {/* 1. PROJECT MANAGER */}
                        <div className="relative z-10">
                            <NodeCard node={pmNode} />
                        </div>

                        {/* Vertical line between PM and Superintendent */}
                        <div className="w-[1.5px] bg-gray-900 h-10 relative">
                            {/* Horizontal connector to PLANT MANAGER (HO) */}
                            <div className="absolute top-5 left-0 w-24 h-[1.5px] bg-gray-900"></div>
                            {/* Plant Manager (HO) Box positioned to the right */}
                            <div className="absolute top-0 left-24 z-10">
                                <NodeCard node={plantMgrHoNode} />
                            </div>
                        </div>

                        {/* 2. Superintendent */}
                        <div className="relative z-10">
                            <NodeCard node={superintendentNode} />
                        </div>

                        {/* Vertical connector down from Superintendent to horizontal distribution bar */}
                        <div className="w-[1.5px] bg-gray-900 h-8"></div>
                    </div>

                    {/* MAIN 5-COLUMN SECTION */}
                    <div className="relative pt-0">
                        {/* Main Horizontal Distribution Bar connecting all 5 columns */}
                        <div className="w-[96%] mx-auto h-[1.5px] bg-gray-900 mb-0"></div>

                        {/* Columns Container */}
                        <div className="flex items-start justify-between gap-6 pt-0 min-w-[1240px]">

                            {/* ========================================================= */}
                            {/* COLUMN 1: Planner & Plant Admin Support */}
                            {/* ========================================================= */}
                            <div className="flex flex-col items-center flex-1">
                                <div className="w-[1.5px] bg-gray-900 h-4"></div>
                                <NodeCard node={spvPlannerNode} />

                                <div className="w-[1.5px] bg-gray-900 h-4"></div>
                                <NodeCard node={fmPlannerNode} />

                                <div className="w-[1.5px] bg-gray-900 h-4"></div>
                                <NodeCard node={officePlantNode} />

                                <div className="w-[1.5px] bg-gray-900 h-4"></div>
                                <NodeCard node={adminPlantNode} />

                                <div className="w-[1.5px] bg-gray-900 h-4"></div>
                                <NodeCard node={toolskeeperNode} />
                            </div>

                            {/* ========================================================= */}
                            {/* COLUMN 2: Preventive & Predictive Maintenance */}
                            {/* ========================================================= */}
                            <div className="flex flex-col items-center flex-[1.6]">
                                <div className="w-[1.5px] bg-gray-900 h-4"></div>
                                <NodeCard node={spvPrevNode} />

                                <div className="w-[1.5px] bg-gray-900 h-4"></div>

                                {/* Sub-branch horizontal divider */}
                                <div className="w-[85%] h-[1.5px] bg-gray-900"></div>

                                <div className="flex items-start justify-between gap-4 w-full">
                                    {/* Left Sub-column: Inspector, Lubecar, Greasing, Washingman */}
                                    <div className="flex flex-col items-center flex-1">
                                        <div className="w-[1.5px] bg-gray-900 h-3"></div>
                                        <NodeCard node={inspectorNode} />

                                        <div className="w-[1.5px] bg-gray-900 h-4"></div>
                                        <NodeCard node={lubecarNode} />

                                        <div className="w-[1.5px] bg-gray-900 h-4"></div>
                                        <NodeCard node={greasingNode} />

                                        <div className="w-[1.5px] bg-gray-900 h-4"></div>
                                        <NodeCard node={washingmanNode} />
                                    </div>

                                    {/* Right Sub-column: Foreman, Serviceman 1-3, Helper */}
                                    <div className="flex flex-col items-center flex-1">
                                        <div className="w-[1.5px] bg-gray-900 h-3"></div>
                                        <NodeCard node={fmPrevNode} />

                                        <div className="w-[1.5px] bg-gray-900 h-4"></div>
                                        <NodeCard node={serviceman1Node} />

                                        <div className="w-[1.5px] bg-gray-900 h-4"></div>
                                        <NodeCard node={serviceman2Node} />

                                        <div className="w-[1.5px] bg-gray-900 h-4"></div>
                                        <NodeCard node={serviceman3Node} />

                                        <div className="w-[1.5px] bg-gray-900 h-4"></div>
                                        <NodeCard node={helperServicemanNode} />
                                    </div>
                                </div>
                            </div>

                            {/* ========================================================= */}
                            {/* COLUMN 3: Corrective Maintenance & Welder */}
                            {/* ========================================================= */}
                            <div className="flex flex-col items-center flex-[1.6]">
                                <div className="w-[1.5px] bg-gray-900 h-4"></div>
                                <NodeCard node={spvCorrNode} />

                                <div className="w-[1.5px] bg-gray-900 h-4"></div>

                                {/* Sub-branch horizontal divider */}
                                <div className="w-[85%] h-[1.5px] bg-gray-900"></div>

                                <div className="flex items-start justify-between gap-4 w-full">
                                    {/* Left Sub-column: Foreman Corr, Mechanic 1, 2, 3, Helper */}
                                    <div className="flex flex-col items-center flex-1">
                                        <div className="w-[1.5px] bg-gray-900 h-3"></div>
                                        <NodeCard node={fmCorrNode} />

                                        <div className="w-[1.5px] bg-gray-900 h-4"></div>
                                        <NodeCard node={mech1Node} />

                                        <div className="w-[1.5px] bg-gray-900 h-4"></div>
                                        <NodeCard node={mech2Node} />

                                        <div className="w-[1.5px] bg-gray-900 h-4"></div>
                                        <NodeCard node={mech3Node} />

                                        <div className="w-[1.5px] bg-gray-900 h-4"></div>
                                        <NodeCard node={helperMechNode} />
                                    </div>

                                    {/* Right Sub-column: Foreman Welder, Welder 1, 2, 3, Helper */}
                                    <div className="flex flex-col items-center flex-1">
                                        <div className="w-[1.5px] bg-gray-900 h-3"></div>
                                        <NodeCard node={fmWelderNode} />

                                        <div className="w-[1.5px] bg-gray-900 h-4"></div>
                                        <NodeCard node={welder1Node} />

                                        <div className="w-[1.5px] bg-gray-900 h-4"></div>
                                        <NodeCard node={welder2Node} />

                                        <div className="w-[1.5px] bg-gray-900 h-4"></div>
                                        <NodeCard node={welder3Node} />

                                        <div className="w-[1.5px] bg-gray-900 h-4"></div>
                                        <NodeCard node={helperWelderNode} />
                                    </div>
                                </div>
                            </div>

                            {/* ========================================================= */}
                            {/* COLUMN 4: Electrical */}
                            {/* ========================================================= */}
                            <div className="flex flex-col items-center flex-1">
                                <div className="w-[1.5px] bg-gray-900 h-4"></div>
                                <NodeCard node={spvElecNode} />

                                <div className="w-[1.5px] bg-gray-900 h-4"></div>
                                <NodeCard node={fmElecNode} />

                                <div className="w-[1.5px] bg-gray-900 h-4"></div>
                                <NodeCard node={elec1Node} />

                                <div className="w-[1.5px] bg-gray-900 h-4"></div>
                                <NodeCard node={elec2Node} />

                                <div className="w-[1.5px] bg-gray-900 h-4"></div>
                                <NodeCard node={elec3Node} />
                            </div>

                            {/* ========================================================= */}
                            {/* COLUMN 5: Tyre & Crane */}
                            {/* ========================================================= */}
                            <div className="flex flex-col items-center flex-[1.4]">
                                <div className="w-[1.5px] bg-gray-900 h-4"></div>
                                <NodeCard node={spvTyreNode} />

                                <div className="w-[1.5px] bg-gray-900 h-4"></div>

                                {/* Sub-branch horizontal divider */}
                                <div className="w-[85%] h-[1.5px] bg-gray-900"></div>

                                <div className="flex items-start justify-between gap-4 w-full">
                                    {/* Left Sub-column: Foreman Tyre, Tyreman 1, 2, 3, Helper */}
                                    <div className="flex flex-col items-center flex-1">
                                        <div className="w-[1.5px] bg-gray-900 h-3"></div>
                                        <NodeCard node={fmTyreNode} />

                                        <div className="w-[1.5px] bg-gray-900 h-4"></div>
                                        <NodeCard node={tyre1Node} />

                                        <div className="w-[1.5px] bg-gray-900 h-4"></div>
                                        <NodeCard node={tyre2Node} />

                                        <div className="w-[1.5px] bg-gray-900 h-4"></div>
                                        <NodeCard node={tyre3Node} />

                                        <div className="w-[1.5px] bg-gray-900 h-4"></div>
                                        <NodeCard node={helperTyreNode} />
                                    </div>

                                    {/* Right Sub-column: Crane & Rigger */}
                                    <div className="flex flex-col items-center flex-1">
                                        <div className="w-[1.5px] bg-gray-900 h-3"></div>
                                        <NodeCard node={craneNode} />

                                        <div className="w-[1.5px] bg-gray-900 h-4"></div>
                                        <NodeCard node={riggerNode} />
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Custom user nodes (if any new ones created) */}
                    {customNodes.length > 0 && (
                        <div className="mt-12 pt-6 border-t-2 border-dashed border-gray-300">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-4 text-center">
                                Posisi Tambahan / Custom
                            </h3>
                            <div className="flex flex-wrap gap-4 justify-center">
                                {customNodes.map(node => (
                                    <NodeCard key={node.id} node={node} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL: Tambah / Edit Posisi & Personil */}
            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="xl">
                <form onSubmit={submitForm} className="p-6">
                    <div className="flex items-center justify-between border-b pb-3 mb-4">
                        <h2 className="text-lg font-bold text-gray-900">
                            {modalMode === 'create' ? 'Tambah Posisi Baru' : 'Edit Posisi & Personil'}
                        </h2>
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Nama Posisi / Jabatan */}
                        <div>
                            <InputLabel htmlFor="jabatan" value="Nama Posisi / Jabatan *" />
                            <TextInput
                                id="jabatan"
                                type="text"
                                className="mt-1 block w-full text-sm font-semibold uppercase"
                                value={data.jabatan}
                                onChange={(e) => setData('jabatan', e.target.value)}
                                placeholder="CONTOH: MECHANIC I, FOREMAN TYRE..."
                                required
                            />
                            <InputError message={errors.jabatan} className="mt-1" />
                        </div>

                        {/* Posisi Atasan (Parent) */}
                        <div>
                            <InputLabel htmlFor="parent_id" value="Posisi Atasan (Parent)" />
                            <select
                                id="parent_id"
                                className="mt-1 block w-full border-gray-300 focus:border-teal-500 focus:ring-teal-500 rounded-md shadow-sm text-sm"
                                value={data.parent_id}
                                onChange={(e) => setData('parent_id', e.target.value)}
                            >
                                <option value="">-- Tidak Ada Atasan (Root) --</option>
                                {flatNodes.filter(n => n.id !== editingId).map((node) => (
                                    <option key={node.id} value={node.id}>
                                        {node.jabatan} {node.name ? `(${node.name})` : ''}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.parent_id} className="mt-1" />
                        </div>

                        {/* Daftar Anggota / Personil */}
                        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50/50">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                                    Daftar Personil ({data.members.length} Orang)
                                </label>
                                <button
                                    type="button"
                                    onClick={handleAddMember}
                                    className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 bg-teal-50 px-2 py-1 rounded border border-teal-200 hover:bg-teal-100"
                                >
                                    <UserPlus className="w-3.5 h-3.5" />
                                    + Tambah Anggota
                                </button>
                            </div>

                            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                                {data.members.map((member, idx) => (
                                    <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded border border-gray-200 shadow-xs">
                                        <span className="text-xs font-bold text-gray-500 w-5 text-center">
                                            {idx + 1}.
                                        </span>

                                        <TextInput
                                            type="text"
                                            className={`text-xs py-1.5 px-2 flex-1 ${
                                                member.is_vacant ? 'bg-gray-100 text-gray-400 italic cursor-not-allowed' : 'bg-white text-gray-900'
                                            }`}
                                            value={member.is_vacant ? 'Vacant' : member.name}
                                            onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                                            placeholder={member.is_vacant ? 'Vacant' : 'Nama Karyawan...'}
                                            disabled={member.is_vacant}
                                        />

                                        <label
                                            className={`flex items-center gap-1.5 cursor-pointer select-none px-2.5 py-1.5 rounded border text-xs font-bold transition-all shadow-xs ${
                                                member.is_vacant
                                                    ? 'bg-sky-500 border-sky-600 text-white'
                                                    : 'bg-gray-50 hover:bg-gray-100 border-gray-300 text-gray-700'
                                            }`}
                                            title={member.is_vacant ? 'Klik untuk membatalkan status Vacant' : 'Klik untuk jadikan Vacant'}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={Boolean(member.is_vacant)}
                                                onChange={(e) => handleToggleVacant(idx, e.target.checked)}
                                                className={`w-3.5 h-3.5 rounded border-gray-300 cursor-pointer ${
                                                    member.is_vacant ? 'accent-sky-600 text-sky-600' : 'text-sky-600'
                                                }`}
                                            />
                                            <span className={member.is_vacant ? 'text-white' : 'text-sky-700'}>
                                                Vacant
                                            </span>
                                        </label>

                                        {data.members.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveMember(idx)}
                                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                                title="Hapus baris ini"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3 border-t pt-4">
                        <SecondaryButton onClick={() => setIsModalOpen(false)}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton type="submit" disabled={processing} className="bg-teal-700 hover:bg-teal-800">
                            {processing ? 'Menyimpan...' : (modalMode === 'create' ? 'Tambah Posisi' : 'Simpan Perubahan')}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
