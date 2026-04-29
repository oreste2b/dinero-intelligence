import { db } from '@/lib/db';
import { activities, contacts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { formatRelativeDate } from '@/lib/crm/constants';
import { EmptyState } from '@/components/crm/shared/EmptyState';

export const dynamic = 'force-dynamic';

const TYPE_ICON: Record<string, string> = {
  call: '📞', email: '✉️', meeting: '📅', note: '📝', follow_up: '🔔',
};

export default async function ActivitiesPage() {
  const rows = await db
    .select({ activity: activities, contact: contacts })
    .from(activities)
    .leftJoin(contacts, eq(activities.contactId, contacts.id));

  const sorted = [...rows].sort(
    (a, b) => new Date(b.activity.createdAt).getTime() - new Date(a.activity.createdAt).getTime()
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Actividades</h1>
        <p className="text-slate-400 text-sm mt-1">{rows.length} actividades registradas</p>
      </div>

      {sorted.length === 0 ? (
        <EmptyState title="Sin actividades" description="Registra llamadas, reuniones y seguimientos." />
      ) : (
        <div className="crm-card divide-y divide-slate-50">
          {sorted.map(({ activity, contact }) => (
            <div key={activity.id} className="flex gap-4 px-5 py-4">
              <span className="text-xl shrink-0">{TYPE_ICON[activity.type] ?? '📋'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800">{activity.description}</p>
                {contact && (
                  <Link href={`/crm/contacts/${contact.id}`} className="text-xs text-indigo-500 hover:underline">
                    {contact.name}
                  </Link>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-slate-400">{formatRelativeDate(activity.createdAt)}</p>
                {activity.completedAt && <p className="text-xs text-emerald-500">✓ completada</p>}
                {!activity.completedAt && activity.scheduledAt && (
                  <p className="text-xs text-amber-500">⏰ {activity.scheduledAt.slice(0, 10)}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
