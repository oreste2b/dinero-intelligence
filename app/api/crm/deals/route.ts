export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { deals, contacts, pipelineStages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import type { CreateDealPayload } from '@/types/crm';

export async function GET() {
  const rows = await db
    .select({
      deal: deals,
      contact: contacts,
      stage: pipelineStages,
    })
    .from(deals)
    .leftJoin(contacts, eq(deals.contactId, contacts.id))
    .leftJoin(pipelineStages, eq(deals.stageId, pipelineStages.id));

  return NextResponse.json(rows.map(r => ({ ...r.deal, contact: r.contact, stage: r.stage })));
}

export async function POST(req: NextRequest) {
  const body: CreateDealPayload = await req.json();
  if (!body.title?.trim()) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 });
  }

  // Default to first stage if none provided
  let stageId = body.stageId ?? null;
  if (!stageId) {
    const [first] = await db.select().from(pipelineStages).orderBy(pipelineStages.order).limit(1);
    stageId = first?.id ?? null;
  }

  const now = new Date().toISOString();
  const deal = {
    id:            randomUUID(),
    title:         body.title.trim(),
    value:         body.value ?? 0,
    stageId,
    contactId:     body.contactId ?? null,
    expectedClose: body.expectedClose ?? null,
    probability:   body.probability ?? 0,
    notes:         body.notes ?? null,
    createdAt:     now,
    updatedAt:     now,
  };

  await db.insert(deals).values(deal);
  return NextResponse.json(deal, { status: 201 });
}
