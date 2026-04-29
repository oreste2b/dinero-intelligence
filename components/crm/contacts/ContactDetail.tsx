'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StatusBadge } from '@/components/crm/shared/StatusBadge';
import { ContactForm } from './ContactForm';
import { ActivityForm } from '@/components/crm/activities/ActivityForm';
import { ACTIVITY_CONFIG, formatCurrency, formatRelativeDate } from '@/lib/crm/constants';
import type { ContactWithDeals, LeadTemperature, ActivityType } from '@/types/crm';

interface Props { contact: ContactWithDeals }

export function ContactDetail({ contact }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<'info' | 'activities' | 'deals'>('info');
  const [activities, setActivities] = useState(contact.activities);

  async function classify() {
    const res = await fetch('/api/crm/classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contactId: contact.id }),
    });
    const result = await res.json();
    alert(`Score: ${result.score} | ${result.temperature}\n${result.nextAction}`);
    router.refresh();
  }

  async function deleteContact() {
    if (!confirm('¿Eliminar este contacto?')) return;
    await fetch(`/api/crm/contacts/${contact.id}`, { method: 'DELETE' });
    router.push('/crm/contacts');
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="crm-card p-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{contact.name}</h1>
          {contact.company && <p className="text-slate-500">{contact.company}</p>}
          <div className="flex items-center gap-3 mt-2">
            <StatusBadge temperature={contact.temperature as LeadTemperature} />
            <span className="text-xs text-slate-400">Score: <strong>{contact.score}</strong></span>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={classify} className="btn-crm-secondary text-xs px-3 py-1.5">🤖 Clasificar</button>
          <button onClick={deleteContact} className="text-xs px-3 py-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">Eliminar</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-100">
        {(['info', 'activities', 'deals'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              tab === t ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t === 'info' ? 'Información' : t === 'activities' ? 'Actividades' : 'Negocios'}
          </button>
        ))}
      </div>

      {tab === 'info' && (
        <ContactForm initial={contact as any} onSaved={() => router.refresh()} />
      )}

      {tab === 'activities' && (
        <div className="space-y-4">
          <ActivityForm contactId={contact.id} onCreated={a => setActivities(prev => [a, ...prev])} />
          <div className="space-y-2">
            {activities.map(a => (
              <div key={a.id} className="crm-card p-4 flex gap-3">
                <span className="text-lg">{a.type === 'call' ? '📞' : a.type === 'email' ? '✉️' : a.type === 'meeting' ? '📅' : a.type === 'follow_up' ? '🔔' : '📝'}</span>
                <div>
                  <p className="text-sm font-medium text-slate-700">{a.description}</p>
                  <p className="text-xs text-slate-400">{formatRelativeDate(a.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'deals' && (
        <div className="space-y-2">
          {contact.deals.length === 0 ? (
            <p className="text-sm text-slate-400">Sin negocios vinculados.</p>
          ) : contact.deals.map(d => (
            <div key={d.id} className="crm-card p-4 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">{d.title}</span>
              <span className="text-sm font-semibold text-indigo-600">{formatCurrency(d.value)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
