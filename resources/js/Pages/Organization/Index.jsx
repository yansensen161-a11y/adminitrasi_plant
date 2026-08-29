import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

const OrgNode = ({ node }) => {
    return (
        <div className="flex flex-col items-center">
            {/* The Node Box */}
            <div className={`relative flex flex-col items-center justify-center p-3 border-2 min-w-[160px] max-w-[200px] text-center shadow-sm z-10 
                ${node.is_vacant 
                    ? 'bg-blue-500 border-blue-600 text-white' 
                    : 'bg-white dark:bg-gray-800 border-gray-400 dark:border-gray-600 text-gray-800 dark:text-gray-200'}`}>
                <div className="text-xs font-bold uppercase border-b border-current pb-1 mb-1 w-full truncate" title={node.jabatan}>
                    {node.jabatan}
                </div>
                <div className="text-sm font-semibold mt-1">
                    {node.name || (node.is_vacant ? 'Vacant' : '-')}
                </div>
            </div>

            {/* Children Connector */}
            {node.children && node.children.length > 0 && (
                <div className="flex flex-col items-center mt-4 relative">
                    {/* Vertical line from parent */}
                    <div className="w-px h-6 bg-gray-400 dark:bg-gray-600 absolute -top-4"></div>
                    
                    {/* Horizontal line for children if more than 1 */}
                    {node.children.length > 1 && (
                        <div className="absolute top-2 w-[calc(100%-50%)] border-t-2 border-gray-400 dark:border-gray-600"></div>
                    )}
                    
                    <div className="flex flex-row justify-center items-start gap-4 pt-2 relative">
                        {/* Render children horizontally */}
                        {node.children.map((child, idx) => (
                            <div key={child.id} className="relative flex flex-col items-center">
                                {/* Vertical line to child */}
                                <div className="w-px h-2 bg-gray-400 dark:bg-gray-600 absolute -top-2"></div>
                                {/* Horizontal connector logic */}
                                {node.children.length > 1 && (
                                    <>
                                        {idx === 0 && <div className="absolute -top-2 right-0 w-1/2 h-px bg-gray-400 dark:bg-gray-600"></div>}
                                        {idx === node.children.length - 1 && <div className="absolute -top-2 left-0 w-1/2 h-px bg-gray-400 dark:bg-gray-600"></div>}
                                        {idx > 0 && idx < node.children.length - 1 && <div className="absolute -top-2 w-full h-px bg-gray-400 dark:bg-gray-600"></div>}
                                    </>
                                )}
                                <OrgNode node={child} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};


export default function Index({ auth, organizationTree }) {
    
    // We expect the tree to have a top-level node (or nodes).
    // Usually there is just one root (Project Manager).
    const roots = organizationTree.filter(node => !node.parent_id);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Organization Structure</h2>}
        >
            <Head title="Organization Structure" />

            <div className="py-8 h-[80vh] overflow-auto">
                <div className="min-w-[1200px] w-full px-8 pb-16 flex justify-center">
                    {roots.map(root => (
                        <OrgNode key={root.id} node={root} />
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
