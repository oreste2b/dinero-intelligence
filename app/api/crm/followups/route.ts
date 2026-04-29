export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { activities, contacts } from '@/lib/db/schema';
import { isNull, eq } from 'drizzle-orm';

export async function GET() {
  const now = new Date().toISOString();
  const upcoming = new Date(Date.now() + 7 * 86_400_000).toISOString();

  const pending = await db
    .select({ activity: activities, contact: contacts })
    .from(activities)
    .leftJoin(contacts, eq(activities.contactId, contacts.id))
    .where(isNull(activities.completedAt));

  const categorised = {
    overdue:  pending.filter(r => r.activity.scheduledAt && r.activity.scheduledAt < now),
    today:    pending.filter(r => r.activity.scheduledAt && r.activity.scheduledAt.startsWith(now.slice(0, 10))),
    upcoming: pending.filter(r => r.activity.scheduledAt && r.activity.scheduledAt > now && r.activity.scheduledAt < upcoming),
  };

  return NextResponse.json(categorised);
}
