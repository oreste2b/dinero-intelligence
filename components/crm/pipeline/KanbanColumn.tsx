import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DealCard } from './DealCard';
import { formatCurrency } from '@/lib/crm/constants';
import type { PipelineColumn } from '@/types/crm';

interface Props { column: PipelineColumn }

export function KanbanColumn({ column }: Props) {
  const { stage, deals, totalValue } = column;
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  return (
    <div className="flex flex-col min-w-64 w-64">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: stage.color ?? '#64748b' }} />
          <span className="text-sm font-semibold text-slate-700">{stage.name}</span>
          <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{deals.length}</span>
        </div>
        <span className="text-xs text-slate-400">{formatCurrency(totalValue)}</span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 rounded-xl p-2 space-y-2 min-h-32 transition-colors ${isOver ? 'bg-indigo-50' : 'bg-slate-50'}`}
      >
        <SortableContext items={deals.map(d => d.id)} strategy={verticalListSortingStrategy}>
          {deals.map(deal => <DealCard key={deal.id} deal={deal} />)}
        </SortableContext>
      </div>
    </div>
  );
}
