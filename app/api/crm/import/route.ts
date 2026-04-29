import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contacts } from '@/lib/db/schema';
import { randomUUID } from 'crypto';

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim().toLowerCase());
  return lines.slice(1).map(line => {
    const values = line.match(/(".*?"|[^,]+)/g) ?? [];
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = (values[i] ?? '').replace(/^"|"$/g, '').trim();
    });
    return row;
  });
}

const FIELD_MAP: Record<string, string> = {
  nombre: 'name', name: 'name',
  correo: 'email', email: 'email',
  telefono: 'phone', phone: 'phone',
  empresa: 'company', company: 'company',
  source: 'source', fuente: 'source',
  notes: 'notes', notas: 'notes',
};

export async function POST(req: NextRequest) {
  const text = await req.text();
  const rows = parseCSV(text);
  if (!rows.length) return NextResponse.json({ error: 'Empty or invalid CSV' }, { status: 400 });

  const now = new Date().toISOString();
  let imported = 0;

  for (const row of rows) {
    const mapped: Record<string, string> = {};
    for (const [k, v] of Object.entries(row)) {
      const field = FIELD_MAP[k];
      if (field) mapped[field] = v;
    }
    if (!mapped.name) continue;

    await db.insert(contacts).values({
      id:          randomUUID(),
      name:        mapped.name,
      email:       mapped.email ?? null,
      phone:       mapped.phone ?? null,
      company:     mapped.company ?? null,
      source:      (mapped.source as any) ?? 'otro',
      temperature: 'cold',
      score:       0,
      notes:       mapped.notes ?? null,
      createdAt:   now,
      updatedAt:   now,
    }).onConflictDoNothing();

    imported++;
  }

  return NextResponse.json({ imported });
}
