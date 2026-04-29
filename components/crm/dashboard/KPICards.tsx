import { formatCurrency } from '@/lib/crm/constants';
import type { DashboardStats } from '@/types/crm';

interface Props { stats: DashboardStats }

function Card({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="crm-card p-5">
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

export function KPICards({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      <Card label="Contactos"      value={String(stats.totalContacts)} />
      <Card label="Negocios activos" value={String(stats.activeDeals)} />
      <Card label="Pipeline"       value={formatCurrency(stats.pipelineValue)} />
      <Card label="Conversión"     value={`${stats.conversionRate.toFixed(1)}%`} />
      <Card label="Leads calientes" value={String(stats.hotLeads)} sub="temperatura hot" />
    </div>
  );
}
