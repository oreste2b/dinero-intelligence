'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { StatusBadge } from '@/components/crm/shared/StatusBadge';
import { EmptyState } from '@/components/crm/shared/EmptyState';
import { SOURCE_LABELS, formatRelativeDate } from '@/lib/crm/constants';
import type { Contact, LeadTemperature, LeadSource } from '@/types/crm';

export function ContactsTable() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [q, setQ] = useState('');
  const [temp, setTemp] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q)    params.set('q', q);
    if (temp) params.set('temperature', temp);
    fetch(`/api/crm/contacts?${params}`)
      .then(r => r.json())
      .then(data => { setContacts(data); setLoading(false); });
  }, [q, temp]);

  return (
    <div className="crm-card overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex flex-wrap gap-3">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Buscar contactos…"
          className="flex-1 min-w-48 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <select
          value={temp}
          onChange={e => setTemp(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm"
        >
          <option value="">Todos</option>
          <option value="hot">🔥 Caliente</option>
          <option value="warm">☀️ Tibio</option>
          <option value="cold">❄️ Frío</option>
        </select>
        <Link href="/crm/contacts/new" className="btn-crm-primary text-sm px-4 py-1.5">
          + Nuevo
        </Link>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-400 text-sm">Cargando…</div>
      ) : contacts.length === 0 ? (
        <EmptyState title="Sin contactos" description="Agrega tu primer contacto para comenzar." />
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-400 text-xs uppercase">
            <tr>
              {['Nombre', 'Empresa', 'Fuente', 'Estado', 'Score', 'Actualizado'].map(h => (
                <th key={h} className="px-4 py-2.5 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {contacts.map(c => (
              <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-800">
                  <Link href={`/crm/contacts/${c.id}`} className="hover:text-indigo-600">{c.name}</Link>
                  {c.email && <span className="block text-xs text-slate-400">{c.email}</span>}
                </td>
                <td className="px-4 py-3 text-slate-500">{c.company ?? '—'}</td>
                <td className="px-4 py-3 text-slate-500">{SOURCE_LABELS[c.source as LeadSource] ?? c.source}</td>
                <td className="px-4 py-3"><StatusBadge temperature={c.temperature as LeadTemperature} /></td>
                <td className="px-4 py-3 font-mono text-slate-600">{c.score}</td>
                <td className="px-4 py-3 text-slate-400 text-xs">{formatRelativeDate(c.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
