export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contacts, activities, deals } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type { UpdateContactPayload } from '@/types/crm';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const [contact] = await db.select().from(contacts).where(eq(contacts.id, params.id));
  if (!contact) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const contactActivities = await db.select().from(activities).where(eq(activities.contactId, params.id));
  const contactDeals = await db.select().from(deals).where(eq(deals.contactId, params.id));

  return NextResponse.json({ ...contact, activities: contactActivities, deals: contactDeals });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body: UpdateContactPayload = await req.json();
  const now = new Date().toISOString();

  const updated = await db
    .update(contacts)
    .set({ ...body, updatedAt: now })
    .where(eq(contacts.id, params.id))
    .returning();

  if (!updated.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(updated[0]);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await db.delete(activities).where(eq(activities.contactId, params.id));
  await db.delete(deals).where(eq(deals.contactId, params.id));
  await db.delete(contacts).where(eq(contacts.id, params.id));
  return new NextResponse(null, { status: 204 });
}
