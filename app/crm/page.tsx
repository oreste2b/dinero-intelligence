export const metadata = { title: 'CRM Dashboard' };

import { db } from '@/lib/db';
import { contacts, deals, pipelineStages, activities } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { KPICards } from '@/components/crm/dashboard/KPICards';
import { formatRelativeDate, ACTIVITY_CONFIG } from '@/lib/crm/constants';
import type { DashboardStats, ActivityType } from '@/types/crm';

export const dynamic = 'force-dynamic';

async function getStats(): Promise<DashboardStats> {
  const allContacts  = await db.select().from(contacts);
  const allDeals     = await db.select().from(deals);
  const allStages    = await db.select().from(pipelineStages).orderBy(pipelineStages.order);
  const allActivities = await db.select().from(activities).orderBy(activities.createdAt);

  const wonStageIds  = allStages.filter(s => s.isWon).map(s => s.id);
  const lostStageIds = allStages.filter(s => s.isLost).map(s => s.id);
  const activeDeals  = allDeals.filter(d => !lostStageIds.includes(d.stageId ?? ''));
  const wonDeals     = allDeals.filter(d => wonStageIds.includes(d.stageId ?? ''));
  const totalDeals   = allDeals.filter(d => wonStageIds.includes(d.stageId ?? '') || lostStageIds.includes(d.stageId ?? ''));

  const pipeline = allStages.map(stage => {
    const stageDeals = activeDeals
      .filter(d => d.stageId === stage.id)
      .map(d => ({ ...d, contact: allContacts.find(c => c.id === d.contactId) ?? null, stage }));
    return {
      stage,
      deals: stageDeals as any,
      totalValue: stageDeals.reduce((s, d) => s + (d.value ?? 0), 0),
    };
  });

  return {
    totalContacts:  allContacts.length,
    activeDeals:    activeDeals.length,
    pipelineValue:  activeDeals.reduce((s, d) => s + (d.value ?? 0), 0),
    conversionRate: totalDeals.length ? (wonDeals.length / totalDeals.length) * 100 : 0,
    hotLeads:       allContacts.filter(c => c.temperature === 'hot').length,
    pipeline,
    recentActivities: allActivities.slice(-5).reverse() as any,
  };
}

export default async function CRMDashboard() {
  const stats = await getStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Resumen de tu pipeline de ventas</p>
      </div>

      <KPICards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline overview */}
        <div className="crm-card p-5">
          <h2 className="text-sm font-semibold text-slate-600 mb-4">Pipeline por etapa</h2>
          <div className="space-y-2">
            {stats.pipeline.filter(c => !c.stage.isLost).map(col => (
              <div key={col.stage.id} className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: col.stage.color ?? '#64748b' }} />
                <span className="text-sm text-slate-600 flex-1">{col.stage.name}</span>
                <span className="text-xs font-mono text-slate-400">{col.deals.length} deals</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="crm-card p-5">
          <h2 className="text-sm font-semibold text-slate-600 mb-4">Actividad reciente</h2>
          {stats.recentActivities.length === 0 ? (
            <p className="text-sm text-slate-400">Sin actividades aún.</p>
          ) : (
            <div className="space-y-3">
              {stats.recentActivities.map(a => (
                <div key={a.id} className="flex gap-3 items-start">
                  <span className="text-base">{a.type === 'call' ? '📞' : a.type === 'email' ? '✉️' : a.type === 'meeting' ? '📅' : '📝'}</span>
                  <div>
                    <p className="text-sm text-slate-700">{a.description}</p>
                    <p className="text-xs text-slate-400">{formatRelativeDate(a.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
