'use client';
import { useState, useCallback } from 'react';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { KanbanColumn } from './KanbanColumn';
import type { PipelineColumn } from '@/types/crm';

interface Props { initialColumns: PipelineColumn[] }

export function KanbanBoard({ initialColumns }: Props) {
  const [columns, setColumns] = useState(initialColumns);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // `over.id` is a stage id (column drop zone)
    const stageId = String(over.id);
    const dealId  = String(active.id);

    // Optimistic update
    setColumns(prev =>
      prev.map(col => ({
        ...col,
        deals: col.deals.filter(d => d.id !== dealId),
      })).map(col => {
        if (col.stage.id !== stageId) return col;
        const deal = initialColumns.flatMap(c => c.deals).find(d => d.id === dealId);
        if (!deal) return col;
        const updated = { ...deal, stageId };
        return { ...col, deals: [...col.deals, updated], totalValue: col.totalValue + updated.value };
      })
    );

    try {
      await fetch('/api/crm/pipeline', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealId, stageId }),
      });
    } catch {
      setColumns(initialColumns); // rollback
    }
  }, [initialColumns]);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map(col => <KanbanColumn key={col.stage.id} column={col} />)}
      </div>
    </DndContext>
  );
}
