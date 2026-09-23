import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    DndContext, 
    closestCorners, 
    KeyboardSensor, 
    PointerSensor, 
    useSensor, 
    useSensors, 
    DragOverlay,
    useDroppable
} from '@dnd-kit/core';
import { 
    SortableContext, 
    verticalListSortingStrategy, 
    useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { router } from '@inertiajs/react';

const COLUMNS = [
    { id: 'WAITING MANPOWER', title: 'WAITING MANPOWER', color: 'bg-amber-100', headerText: 'text-amber-800', dot: 'bg-amber-500' },
    { id: 'IN PROGRES', title: 'IN PROGRES', color: 'bg-blue-100', headerText: 'text-blue-800', dot: 'bg-blue-500' },
    { id: 'COMPLETED', title: 'COMPLETED', color: 'bg-emerald-100', headerText: 'text-emerald-800', dot: 'bg-emerald-500' },
    { id: 'CANCELLED / ON HOLD', title: 'CANCELLED / ON HOLD', color: 'bg-gray-100', headerText: 'text-gray-700', dot: 'bg-gray-400' }
];

const ItemCard = React.forwardRef(({ item, onClick, isReadonly, isDragging, style, ...props }, ref) => {
    const firstPart = item.parts && item.parts.length > 0 ? item.parts[0] : null;

    let priorityBadge = <span className="bg-amber-100 text-amber-600 text-[9px] px-2 py-0.5 rounded font-bold">Medium</span>;
    if (item.priority === 'High') priorityBadge = <span className="bg-red-100 text-red-500 text-[9px] px-2 py-0.5 rounded font-bold">High</span>;
    if (item.priority === 'Low') priorityBadge = <span className="bg-emerald-100 text-emerald-500 text-[9px] px-2 py-0.5 rounded font-bold">Low</span>;

    return (
        <div 
            ref={ref} 
            style={style} 
            className={`bg-white rounded-lg shadow-sm border border-slate-200 p-3 mb-3 ${isDragging ? 'opacity-40' : ''} ${isReadonly ? '' : 'cursor-grab active:cursor-grabbing'}`}
            {...props}
            onClick={() => onClick(item)}
        >
            <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-800 text-sm">{item.unit?.code_unit || '-'}</span>
                    <span className="text-slate-400 text-xs">{item.unit?.model || '-'}</span>
                </div>
                {item.maintenance_order?.no_order && (
                    <a href={`/monitoring-orders?search=${item.maintenance_order.no_order}`} className="text-blue-500 hover:underline text-[9px] font-bold" onClick={e => e.stopPropagation()}>
                        {item.maintenance_order.no_order}
                    </a>
                )}
            </div>
            
            <div className="font-bold text-slate-700 text-sm tracking-tight mb-0.5">{firstPart?.part_name || '-'}</div>
            <div className="text-slate-500 text-xs mb-2">{firstPart?.description || '-'}</div>
            
            <div className="mb-3">
                {priorityBadge}
            </div>
            
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                <div className="flex items-center text-slate-400 text-[9px]">
                    <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    {new Date(item.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </div>
                <div className="flex items-center text-slate-500 text-xs font-medium">
                    <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                    {item.pic || 'Menunggu manpower'}
                </div>
            </div>
            
            {isReadonly && (
                <div className="absolute top-0 right-0 bg-slate-800 text-white text-[8px] px-1 py-0.5 rounded-bl opacity-50">AUTO</div>
            )}
        </div>
    );
});

const SortableItem = ({ item, onClick, isReadonly }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: String(item.id), disabled: isReadonly });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <ItemCard 
            ref={setNodeRef}
            style={style}
            item={item}
            onClick={onClick}
            isReadonly={isReadonly}
            isDragging={isDragging}
            {...(isReadonly ? {} : { ...attributes, ...listeners })}
        />
    );
};

const DroppableColumn = ({ column, items, openViewModal, openEditModal }) => {
    const { setNodeRef } = useDroppable({ id: column.id });
    
    return (
        <div className="flex flex-col h-full bg-white/50 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className={`${column.color} px-4 py-3 flex items-center justify-between border-b border-white/50`}>
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${column.dot}`}></div>
                    <h3 className={`font-bold text-sm uppercase tracking-wider ${column.headerText}`}>
                        {column.title}
                    </h3>
                </div>
                <div className={`text-xs font-bold px-2 py-0.5 rounded-full ${column.dot} text-white`}>
                    {items.length}
                </div>
            </div>
            
            <div ref={setNodeRef} className="p-3 flex-1 min-h-[300px]">
                <SortableContext 
                    id={column.id}
                    items={items.map(i => String(i.id))}
                    strategy={verticalListSortingStrategy}
                >
                    {items.length > 0 ? (
                        items.map(item => (
                            <SortableItem 
                                key={item.id} 
                                item={item} 
                                onClick={() => item.is_readonly ? openViewModal(item) : openEditModal(item)}
                                isReadonly={item.is_readonly}
                            />
                        ))
                    ) : (
                        <div className="h-full min-h-[150px] border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                            <svg className="w-8 h-8 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>
                            <p className="text-xs font-medium">Tidak ada data</p>
                            <p className="text-[9px] mt-1 opacity-75">Drag & drop card ke sini</p>
                        </div>
                    )}
                </SortableContext>
            </div>
        </div>
    );
};

export default function PartCanibalBoard({ canibals, openViewModal, openEditModal }) {
    const [items, setItems] = useState([]);
    const [activeId, setActiveId] = useState(null);

    // Map backend statuses to kanban columns
    const mapStatusToColumn = (status) => {
        if (!status) return 'WAITING MANPOWER';
        const upper = status.toUpperCase();
        if (upper === 'AVAILABLE' || upper === 'WAITING PART') return 'WAITING MANPOWER';
        if (upper === 'IN PROGRES' || upper === 'PART TER SUPPLY') return 'IN PROGRES';
        if (upper === 'COMPLETED' || upper === 'USED' || upper === 'DONE INSTAL') return 'COMPLETED';
        if (upper === 'CANCELLED / ON HOLD' || upper === 'UNAVAILABLE') return 'CANCELLED / ON HOLD';
        return 'WAITING MANPOWER';
    };

    useEffect(() => {
        if (canibals) {
            setItems(canibals.map(item => ({
                ...item,
                kanbanStatus: mapStatusToColumn(item.status)
            })));
        }
    }, [canibals]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor)
    );

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeIdStr = String(active.id);
        const overIdStr = String(over.id);

        const activeItem = items.find(x => String(x.id) === activeIdStr);
        if (!activeItem || activeItem.is_readonly) return; // Disallow dragging readonly items

        const overColumn = COLUMNS.find(c => c.id === overIdStr) ? overIdStr : items.find(x => String(x.id) === overIdStr)?.kanbanStatus;
        
        if (!overColumn || activeItem.kanbanStatus === overColumn) return;

        // Optimistic UI update
        setItems(prev => prev.map(item => 
            String(item.id) === activeIdStr ? { ...item, kanbanStatus: overColumn } : item
        ));

        // Call backend API to update status
        axios.put(`/part-canibals/${activeItem.id}/status`, { status: overColumn })
            .then(() => {
                router.reload({ only: ['canibals', 'canibalStats'] });
            })
            .catch(err => {
                console.error("Failed to update status", err);
                // Revert on failure
                router.reload({ only: ['canibals'] });
            });
    };

    const getItemsByColumn = (columnId) => items.filter(i => i.kanbanStatus === columnId);

    const activeItem = activeId ? items.find(x => String(x.id) === String(activeId)) : null;

    return (
        <div className="bg-slate-50 dark:bg-transparent min-h-screen p-4 sm:p-6 rounded-xl mt-4">
            <DndContext 
                sensors={sensors} 
                collisionDetection={closestCorners} 
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {COLUMNS.map(column => {
                        const columnItems = getItemsByColumn(column.id);
                        return (
                            <DroppableColumn key={column.id} column={column} items={columnItems} openViewModal={openViewModal} openEditModal={openEditModal} />
                        );
                    })}
                </div>

                <DragOverlay>
                    {activeItem ? (
                        <ItemCard item={activeItem} onClick={() => {}} isReadonly={false} isDragging={true} />
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
