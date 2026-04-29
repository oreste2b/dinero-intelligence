export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { deals, contacts, pipelineStages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type { PipelineColumn } from '@/types/crm';

export async function GET() {
  const stages = await db.select().from(pipelineStages).orderBy(pipelineStages.order);
  const allDeals = await db
    .select({ deal: deals, contact: contacts })
    .from(deals)
    .leftJoin(contacts, eq(deals.contactId, contacts.id));

  const columns = stages.map(stage => {
    const stageDeals = allDeals
      .filter(r => r.deal.stageId === stage.id)
      .map(r => ({ ...r.deal, contact: r.contact, stage }));
    return {
      stage,
      deals: stageDeals,
      totalValue: stageDeals.reduce((sum, d) => sum + (d.value ?? 0), 0),
    };
  });

  return NextResponse.json(columns);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();

  // Move deal: { dealId, stageId }
  if (body.dealId && body.stageId) {
    const now = new Date().toISOString();
    const updated = await db
      .update(deals)
      .set({ stageId: body.stageId, updatedAt: now })
      .where(eq(deals.id, body.dealId))
      .returning();
    return NextResponse.json(updated[0]);
  }

  return NextResponse.json({ error: 'dealId and stageId required' }, { status: 400 });
}
