import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { deals } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type { UpdateDealPayload } from '@/types/crm';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body: UpdateDealPayload = await req.json();
  const now = new Date().toISOString();

  const updated = await db
    .update(deals)
    .set({ ...body, updatedAt: now })
    .where(eq(deals.id, params.id))
    .returning();

  if (!updated.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(updated[0]);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await db.delete(deals).where(eq(deals.id, params.id));
  return new NextResponse(null, { status: 204 });
}
