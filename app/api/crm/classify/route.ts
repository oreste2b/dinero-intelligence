import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contacts, activities, deals } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { scoreContact } from '@/lib/crm/scoring';
import type { ClassifyResult } from '@/types/crm';

export async function POST(req: NextRequest) {
  const { contactId } = await req.json();
  if (!contactId) return NextResponse.json({ error: 'contactId required' }, { status: 400 });

  const [contact] = await db.select().from(contacts).where(eq(contacts.id, contactId));
  if (!contact) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const contactActivities = await db.select().from(activities).where(eq(activities.contactId, contactId));
  const contactDeals = await db.select().from(deals).where(eq(deals.contactId, contactId));

  const { score, temperature } = scoreContact({
    contact: contact as any,
    activities: contactActivities as any,
    deals: contactDeals as any,
  });

  const result: ClassifyResult = {
    temperature,
    score,
    nextAction: temperature === 'hot'
      ? 'Programar reunión de cierre'
      : temperature === 'warm'
      ? 'Enviar propuesta personalizada'
      : 'Nutrir con contenido relevante',
    reasoning: `Score calculado en base a temperatura (${contact.temperature}), completitud del perfil y ${contactActivities.length} actividades registradas.`,
  };

  // Persist updated score & temperature
  await db
    .update(contacts)
    .set({ score, temperature, updatedAt: new Date().toISOString() })
    .where(eq(contacts.id, contactId));

  return NextResponse.json(result);
}
