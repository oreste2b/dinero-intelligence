export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contacts, deals, pipelineStages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

function toCSV(rows: Record<string, unknown>[]): string {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(','),
    ...rows.map(r =>
      headers.map(h => {
        const v = String(r[h] ?? '').replace(/"/g, '""');
        return `"${v}"`;
      }).join(',')
    ),
  ];
  return lines.join('\n');
}

export async function GET(req: NextRequest) {
  const type = new URL(req.url).searchParams.get('type') ?? 'contacts';

  let csv: string;
  let filename: string;

  if (type === 'deals') {
    const rows = await db
      .select({ deal: deals, contact: contacts, stage: pipelineStages })
      .from(deals)
      .leftJoin(contacts, eq(deals.contactId, contacts.id))
      .leftJoin(pipelineStages, eq(deals.stageId, pipelineStages.id));

    csv = toCSV(rows.map(r => ({
      id:            r.deal.id,
      title:         r.deal.title,
      value_dkk:     ((r.deal.value ?? 0) / 100).toFixed(2),
      stage:         r.stage?.name ?? '',
      contact:       r.contact?.name ?? '',
      probability:   r.deal.probability,
      expected_close: r.deal.expectedClose ?? '',
      created_at:    r.deal.createdAt,
    })));
    filename = 'deals.csv';
  } else {
    const rows = await db.select().from(contacts);
    csv = toCSV(rows as unknown as Record<string, unknown>[]);
    filename = 'contacts.csv';
  }

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
