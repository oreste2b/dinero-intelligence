export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contacts } from '@/lib/db/schema';
import { like, or, eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import type { CreateContactPayload } from '@/types/crm';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim();
  const temperature = searchParams.get('temperature');
  const source = searchParams.get('source');

  const filters = [];
  if (q)           filters.push(or(like(contacts.name, `%${q}%`), like(contacts.email, `%${q}%`), like(contacts.company, `%${q}%`))!);
  if (temperature) filters.push(eq(contacts.temperature, temperature));
  if (source)      filters.push(eq(contacts.source, source));

  const rows = await (
    filters.length
      ? db.select().from(contacts).where(and(...filters))
      : db.select().from(contacts)
  );

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body: CreateContactPayload = await req.json();
  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }

  const now = new Date().toISOString();
  const contact = {
    id:          randomUUID(),
    name:        body.name.trim(),
    email:       body.email ?? null,
    phone:       body.phone ?? null,
    company:     body.company ?? null,
    source:      body.source ?? 'otro',
    temperature: body.temperature ?? 'cold',
    score:       0,
    notes:       body.notes ?? null,
    createdAt:   now,
    updatedAt:   now,
  };

  await db.insert(contacts).values(contact);
  return NextResponse.json(contact, { status: 201 });
}
