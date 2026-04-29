import { db } from '@/lib/db';
import { deals, contacts, pipelineStages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { formatCurrency } from '@/lib/crm/constants';
import { EmptyState } from '@/components/crm/shared/EmptyState';

export const dynamic = 'force-dynamic';

export default async function DealsPage() {
  const rows = await db
    .select({ deal: deals, contact: contacts, stage: pipelineStages })
    .from(deals)
    .leftJoin(contacts, eq(deals.contactId, contacts.id))
    .leftJoin(pipelineStages, eq(deals.stageId, pipelineStages.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Negocios</h1>
          <p className="text-slate-400 text-sm mt-1">{rows.length} negocios en total</p>
        </div>
        <Link href="/crm/deals/new" className="btn-crm-primary px-4 py-2 text-sm">+ Nuevo</Link>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="Sin negocios" description="Crea tu primer negocio para comenzar." />
      ) : (
        <div className="crm-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-400 text-xs uppercase">
              <tr>
                {['Título', 'Valor', 'Etapa', 'Contacto', 'Probabilidad', 'Cierre'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rows.map(({ deal, contact, stage }) => (
                <tr key={deal.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{deal.title}</td>
                  <td className="px-4 py-3 font-semibold text-indigo-600">{formatCurrency(deal.value ?? 0)}</td>
                  <td className="px-4 py-3">
                    {stage && (
                      <span className="inline-flex items-center gap-1.5 text-xs">
                        <span className="w-2 h-2 rounded-full" style={{ background: stage.color ?? '#64748b' }} />
                        {stage.name}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{contact?.name ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-slate-100">
                        <div className="h-1.5 rounded-full bg-indigo-400" style={{ width: `${deal.probability}%` }} />
                      </div>
                      <span className="text-xs text-slate-400">{deal.probability}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{deal.expectedClose ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
