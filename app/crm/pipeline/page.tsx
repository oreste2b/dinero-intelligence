import { db } from '@/lib/db';
import { deals, contacts, pipelineStages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { KanbanBoard } from '@/components/crm/pipeline/KanbanBoard';
import type { PipelineColumn } from '@/types/crm';

export const dynamic = 'force-dynamic';

export default async function PipelinePage() {
  const stages = await db.select().from(pipelineStages).orderBy(pipelineStages.order);
  const allDeals = await db
    .select({ deal: deals, contact: contacts })
    .from(deals)
    .leftJoin(contacts, eq(deals.contactId, contacts.id));

  const columns: PipelineColumn[] = stages.map(stage => {
    const stageDeals = allDeals
      .filter(r => r.deal.stageId === stage.id)
      .map(r => ({ ...r.deal, contact: r.contact ?? null, stage }));
    return {
      stage,
      deals: stageDeals as any,
      totalValue: stageDeals.reduce((s, d) => s + (d.value ?? 0), 0),
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Pipeline</h1>
        <p className="text-slate-400 text-sm mt-1">Arrastra los negocios entre etapas</p>
      </div>
      <KanbanBoard initialColumns={columns} />
    </div>
  );
}
