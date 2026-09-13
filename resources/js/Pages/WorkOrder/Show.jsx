import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

// Common SVG Icons
const BackIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
);

const PrinterIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
);

const UserIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
);

export default function Show({ workOrder }) {
    const [activeTab, setActiveTab] = useState('master');
    const wo = workOrder;

    const tabs = [
        { id: 'master', label: 'WO Master & Detail' },
        { id: 'parts', label: 'Parts / Material' },
        { id: 'manpower', label: 'Manpower' },
        { id: 'vendor', label: 'External / Vendor' },
        { id: 'warranty', label: 'Warranty Claim' },
        { id: 'history', label: 'Status History' },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'master':
                return (
                    <div className="space-y-6">
                        {/* Summary Card */}
                        <div className="bg-gray-50 border border-gray-200 rounded p-4 grid grid-cols-4 gap-4">
                            <div>
                                <div className="text-sm text-gray-500 font-bold uppercase mb-1">Unit Code</div>
                                <div className="text-sm font-black text-[#012922]">{wo.unit?.code_unit || '-'}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 font-bold uppercase mb-1">HM Unit</div>
                                <div className="text-sm font-black text-[#012922]">{wo.hm_unit || '-'}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 font-bold uppercase mb-1">Priority</div>
                                <div className="text-sm font-black text-red-600">{wo.priority || 'MEDIUM'}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 font-bold uppercase mb-1">Maintenance Type</div>
                                <div className="text-sm font-black text-[#012922]">{wo.tipe_wo || '-'}</div>
                            </div>
                        </div>

                        {/* Detail Inputs */}
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-sm font-bold text-gray-800 border-b pb-2 mb-4">Problem / Request</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Problem Description</label>
                                        <textarea readOnly className="w-full bg-gray-50 border border-gray-300 rounded text-sm text-gray-700 p-2 min-h-[80px]" value={wo.problem || wo.failure_description || ''} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Job Instruction</label>
                                        <textarea readOnly className="w-full bg-gray-50 border border-gray-300 rounded text-sm text-gray-700 p-2 min-h-[80px]" value={wo.job_instruction || ''} />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-800 border-b pb-2 mb-4">Completion / Findings</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Root Cause</label>
                                        <textarea readOnly className="w-full bg-gray-50 border border-gray-300 rounded text-sm text-gray-700 p-2 min-h-[80px]" value={wo.root_cause || ''} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Corrective Action</label>
                                        <textarea readOnly className="w-full bg-gray-50 border border-gray-300 rounded text-sm text-gray-700 p-2 min-h-[80px]" value={wo.corrective_action || ''} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'parts':
                return (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-gray-800">Parts Required</h3>
                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-bold shadow-sm transition-colors">+ Request Part</button>
                        </div>
                        <div className="border border-gray-200 rounded overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-100 border-b border-gray-200">
                                    <tr>
                                        <th className="py-2.5 px-4 text-sm font-bold text-gray-700 uppercase">Part No</th>
                                        <th className="py-2.5 px-4 text-sm font-bold text-gray-700 uppercase">Description</th>
                                        <th className="py-2.5 px-4 text-sm font-bold text-gray-700 uppercase text-center">Qty Req</th>
                                        <th className="py-2.5 px-4 text-sm font-bold text-gray-700 uppercase text-center">Qty Used</th>
                                        <th className="py-2.5 px-4 text-sm font-bold text-gray-700 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {wo.parts && wo.parts.length > 0 ? (
                                        wo.parts.map(p => (
                                            <tr key={p.id} className="border-b border-gray-100">
                                                <td className="py-2 px-4 text-sm font-medium">{p.part_number}</td>
                                                <td className="py-2 px-4 text-sm text-gray-600">{p.description}</td>
                                                <td className="py-2 px-4 text-sm text-center font-bold">{p.qty_request}</td>
                                                <td className="py-2 px-4 text-sm text-center font-bold">{p.qty_used}</td>
                                                <td className="py-2 px-4 text-sm">
                                                    <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs font-bold uppercase">{p.status}</span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="5" className="py-6 text-center text-gray-400 text-sm italic">No parts requested yet.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'manpower':
                return (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-gray-800">Manpower Assignment</h3>
                            <button className="bg-[#0b6e4f] hover:bg-[#095940] text-white px-4 py-2 rounded text-sm font-bold shadow-sm transition-colors">+ Assign Mechanic</button>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            {wo.manpowers && wo.manpowers.length > 0 ? (
                                wo.manpowers.map(m => (
                                    <div key={m.id} className="border border-gray-200 rounded p-4 flex items-start gap-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                                            <UserIcon />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-gray-800">{m.mechanic}</div>
                                            <div className="text-sm text-gray-500 mt-1">Start: {m.start || '-'}</div>
                                            <div className="text-sm text-gray-500">Finish: {m.finish || '-'}</div>
                                            <div className="text-sm font-bold text-blue-600 mt-1">Total: {m.man_hours} Hrs</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-3 py-6 text-center text-gray-400 text-sm italic border border-dashed border-gray-300 rounded">No mechanics assigned yet.</div>
                            )}
                        </div>
                    </div>
                );
            default:
                return <div className="py-6 text-center text-gray-400 italic">This module is currently under development.</div>;
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Work Order ${wo.no_wo}`} />

            <div className="bg-slate-50 dark:bg-transparent min-h-screen pb-10 flex flex-col">
                {/* Header */}
                <div className="bg-white px-6 py-4 shadow-sm border-b border-gray-200 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/work-orders" className="w-10 h-10 border border-gray-200 rounded flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors">
                            <BackIcon />
                        </Link>
                        <div>
                            <h1 className="text-xl font-black text-[#012922] tracking-tight">{wo.no_wo}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${wo.status_wo === 'OPEN' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>{wo.status_wo || 'OPEN'}</span>
                                <span className="text-sm text-gray-500 font-medium">Created on {new Date(wo.created_at).toLocaleDateString('id-ID')}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded shadow-sm text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                            <PrinterIcon /> Print WO
                        </button>
                        {wo.status_wo === 'OPEN' && (
                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow-sm text-sm font-bold transition-colors">
                                Assign Job
                            </button>
                        )}
                        {wo.status_wo === 'PROCESS' && (
                            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded shadow-sm text-sm font-bold transition-colors">
                                Complete WO
                            </button>
                        )}
                    </div>
                </div>

                <div className="max-w-[1600px] mx-auto px-6 py-6 w-full">
                    <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                        
                        {/* Tabs Navbar */}
                        <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`whitespace-nowrap py-3.5 px-6 text-sm font-bold text-center transition-colors border-b-2 ${
                                        activeTab === tab.id 
                                            ? 'border-[#0b6e4f] text-[#0b6e4f] bg-white' 
                                            : 'border-transparent text-gray-500 hover:bg-gray-100'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Content Area */}
                        <div className="p-6">
                            {renderTabContent()}
                        </div>
                        
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
