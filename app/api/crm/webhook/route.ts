import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contacts, activities } from '@/lib/db/schema';
import { randomUUID } from 'crypto';

const FIELD_MAP: Record<string, string> = {
  nombre: 'name', name: 'name', full_name: 'name',
  correo: 'email', email: 'email',
  telefono: 'phone', phone: 'phone', tel: 'phone',
  empresa: 'company', company: 'company', organization: 'company',
};

function extractFields(body: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};

  // Typeform nested format: { answers: [{ field: { ref }, text }] }
  if (Array.isArray(body.answers)) {
    for (const ans of body.answers as any[]) {
      const ref = (ans.field?.ref ?? '').toLowerCase();
      const field = FIELD_MAP[ref];
      if (field) out[field] = String(ans.text ?? ans.email ?? ans.phone_number ?? '');
    }
    return out;
  }

  // Flat format
  for (const [k, v] of Object.entries(body)) {
    const field = FIELD_MAP[k.toLowerCase()];
    if (field) out[field] = String(v);
  }
  return out;
}

export async function POST(req: NextRequest) {
  const secret = process.env.WEBHOOK_SECRET;
  if (secret && req.headers.get('x-webhook-secret') !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const fields = extractFields(body);

  if (!fields.name) return NextResponse.json({ error: 'name field required' }, { status: 400 });

  const now = new Date().toISOString();
  const contactId = randomUUID();

  await db.insert(contacts).values({
    id:          contactId,
    name:        fields.name,
    email:       fields.email ?? null,
    phone:       fields.phone ?? null,
    company:     fields.company ?? null,
    source:      'webhook',
    temperature: 'cold',
    score:       0,
    notes:       null,
    createdAt:   now,
    updatedAt:   now,
  });

  await db.insert(activities).values({
    id:          randomUUID(),
    type:        'note',
    description: 'Lead recibido vía webhook',
    contactId,
    dealId:      null,
    scheduledAt: null,
    completedAt: now,
    createdAt:   now,
  });

  return NextResponse.json({ contactId }, { status: 201 });
}
