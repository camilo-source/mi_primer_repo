import { useState } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragStartEvent,
    type DragEndEvent,
    type DragOverEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { type Candidate } from './CandidateTable';

// Define the possible statuses and their order
const COLUMNS = [
    { id: 'pending', title: 'Nuevos', color: 'yellow' },
    { id: 'in_progress', title: 'En Proceso', color: 'blue' },
    { id: 'confirmed', title: 'Agendados', color: 'emerald' },
] as const;

type ColumnId = typeof COLUMNS[number]['id'];

interface KanbanBoardProps {
    candidates: Candidate[];
    onStatusChange: (candidateId: string, newStatus: string) => Promise<void>;
    onSchedule: (candidateId: string) => void;
}

export function KanbanBoard({ candidates, onStatusChange, onSchedule }: KanbanBoardProps) {
    const [activeCandidate, setActiveCandidate] = useState<Candidate | null>(null);
    const [items, setItems] = useState<Candidate[]>(candidates);

    // Update items when candidates prop changes
    if (JSON.stringify(candidates.map(c => c.id)) !== JSON.stringify(items.map(i => i.id))) {
        setItems(candidates);
    }

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Map old statuses to new column structure
    const mapStatusToColumn = (status: string): ColumnId => {
        switch (status) {
            case 'pending':
                return 'pending';
            case 'sent':
            case 'replied':
                return 'in_progress';
            case 'confirmed':
                return 'confirmed';
            default:
                return 'pending';
        }
    };

    const getCandidatesByColumn = (columnId: ColumnId): Candidate[] => {
        return items.filter(candidate => {
            const status = candidate.estado_agenda || 'pending';
            return mapStatusToColumn(status) === columnId;
        });
    };

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const candidate = items.find(c => c.id === active.id);
        if (candidate) {
            setActiveCandidate(candidate);
        }
    };

    // Map column ID to actual database status
    const mapColumnToStatus = (columnId: ColumnId): string => {
        switch (columnId) {
            case 'pending':
                return 'pending';
            case 'in_progress':
                return 'sent'; // Default to 'sent' for in_progress column
            case 'confirmed':
                return 'confirmed';
            default:
                return 'pending';
        }
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        // Find which column the item is being dragged over
        const isOverColumn = COLUMNS.some(col => col.id === overId);

        if (isOverColumn) {
            // Dragging over a column header - map to actual status
            const columnId = overId as ColumnId;
            const newStatus = mapColumnToStatus(columnId);
            setItems(prev =>
                prev.map(item =>
                    item.id === activeId
                        ? { ...item, estado_agenda: newStatus }
                        : item
                )
            );
        } else {
            // Dragging over another card - find which column it's in
            const overItem = items.find(item => item.id === overId);
            if (overItem) {
                const newStatus = overItem.estado_agenda || 'pending';
                setItems(prev =>
                    prev.map(item =>
                        item.id === activeId
                            ? { ...item, estado_agenda: newStatus }
                            : item
                    )
                );
            }
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveCandidate(null);

        if (!over) return;

        const activeId = active.id as string;
        const candidate = items.find(c => c.id === activeId);

        if (candidate) {
            const originalStatus = candidates.find(c => c.id === activeId)?.estado_agenda || 'pending';
            const newStatus = candidate.estado_agenda || 'pending';

            if (originalStatus !== newStatus) {
                try {
                    await onStatusChange(activeId, newStatus);
                } catch (error) {
                    // Revert on error
                    setItems(candidates);
                }
            }
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-4 overflow-x-auto pb-4 min-h-[600px]">
                {COLUMNS.map(column => (
                    <KanbanColumn
                        key={column.id}
                        id={column.id}
                        title={column.title}
                        color={column.color}
                        count={getCandidatesByColumn(column.id).length}
                    >
                        <SortableContext
                            items={getCandidatesByColumn(column.id).map(c => c.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {getCandidatesByColumn(column.id).map(candidate => (
                                <KanbanCard
                                    key={candidate.id}
                                    candidate={candidate}
                                    onSchedule={onSchedule}
                                    onStatusChange={async (id: string, status: string) => {
                                        await onStatusChange(id, status);
                                        setItems(prev => prev.map(c => c.id === id ? { ...c, estado_agenda: status } : c));
                                    }}
                                />
                            ))}
                        </SortableContext>
                    </KanbanColumn>
                ))}
            </div>

            <DragOverlay>
                {activeCandidate ? (
                    <KanbanCard
                        candidate={activeCandidate}
                        onSchedule={onSchedule}
                        onStatusChange={() => { }}
                        isDragging
                    />
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
