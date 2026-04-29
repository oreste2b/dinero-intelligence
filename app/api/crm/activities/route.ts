export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { activities } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import type { CreateActivityPayload } from '@/types/crm';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const contactId = searchParams.get('contactId');
  const dealId    = searchParams.get('dealId');

  const rows = await (
    contactId ? db.select().from(activities).where(eq(activities.contactId, contactId)) :
    dealId    ? db.select().from(activities).where(eq(activities.dealId, dealId)) :
                db.select().from(activities)
  );

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body: CreateActivityPayload = await req.json();
  if (!body.type || !body.description?.trim()) {
    return NextResponse.json({ error: 'type and description are required' }, { status: 400 });
  }

  const now = new Date().toISOString();
  const activity = {
    id:          randomUUID(),
    type:        body.type,
    description: body.description.trim(),
    contactId:   body.contactId ?? null,
    dealId:      body.dealId ?? null,
    scheduledAt: body.scheduledAt ?? null,
    completedAt: null,
    createdAt:   now,
  };

  await db.insert(activities).values(activity);
  return NextResponse.json(activity, { status: 201 });
}
