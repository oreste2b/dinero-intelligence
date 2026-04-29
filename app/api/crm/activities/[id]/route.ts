import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { activities } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const updated = await db
    .update(activities)
    .set(body)
    .where(eq(activities.id, params.id))
    .returning();

  if (!updated.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(updated[0]);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await db.delete(activities).where(eq(activities.id, params.id));
  return new NextResponse(null, { status: 204 });
}
