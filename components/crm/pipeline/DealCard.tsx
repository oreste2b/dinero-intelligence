import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { StatusBadge } from '@/components/crm/shared/StatusBadge';
import { formatCurrency } from '@/lib/crm/constants';
import type { DealWithContact, LeadTemperature } from '@/types/crm';

interface Props { deal: DealWithContact }

export function DealCard({ deal }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: deal.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      {...attributes}
      {...listeners}
      className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm cursor-grab active:cursor-grabbing select-none space-y-2"
    >
      <p className="text-sm font-semibold text-slate-800 leading-tight">{deal.title}</p>
      {deal.contact && <p className="text-xs text-slate-400">{deal.contact.name}</p>}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-indigo-600">{formatCurrency(deal.value)}</span>
        {deal.contact && <StatusBadge temperature={deal.contact.temperature as LeadTemperature} />}
      </div>
      {deal.probability > 0 && (
        <div className="h-1 rounded-full bg-slate-100">
          <div className="h-1 rounded-full bg-indigo-400" style={{ width: `${deal.probability}%` }} />
        </div>
      )}
    </div>
  );
}
