'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CreateContactPayload, LeadTemperature, LeadSource } from '@/types/crm';
import { SOURCE_LABELS } from '@/lib/crm/constants';

interface Props {
  initial?: Partial<CreateContactPayload> & { id?: string };
  onSaved?: () => void;
}

export function ContactForm({ initial, onSaved }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<CreateContactPayload>({
    name: initial?.name ?? '',
    email: initial?.email ?? '',
    phone: initial?.phone ?? '',
    company: initial?.company ?? '',
    source: initial?.source ?? 'otro',
    temperature: initial?.temperature ?? 'cold',
    notes: initial?.notes ?? '',
  });
  const [saving, setSaving] = useState(false);

  const set = (k: keyof CreateContactPayload) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const method = initial?.id ? 'PUT' : 'POST';
    const url    = initial?.id ? `/api/crm/contacts/${initial.id}` : '/api/crm/contacts';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setSaving(false);
    onSaved?.();
    if (!initial?.id) router.push('/crm/contacts');
  }

  return (
    <form onSubmit={submit} className="space-y-4 max-w-lg">
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Nombre *</label>
        <input required value={form.name} onChange={set('name')} className="crm-input w-full" placeholder="Nombre completo" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Correo</label>
          <input type="email" value={form.email ?? ''} onChange={set('email')} className="crm-input w-full" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Teléfono</label>
          <input value={form.phone ?? ''} onChange={set('phone')} className="crm-input w-full" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Empresa</label>
        <input value={form.company ?? ''} onChange={set('company')} className="crm-input w-full" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Fuente</label>
          <select value={form.source} onChange={set('source')} className="crm-input w-full">
            {Object.entries(SOURCE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Temperatura</label>
          <select value={form.temperature} onChange={set('temperature')} className="crm-input w-full">
            <option value="cold">❄️ Frío</option>
            <option value="warm">☀️ Tibio</option>
            <option value="hot">🔥 Caliente</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Notas</label>
        <textarea value={form.notes ?? ''} onChange={set('notes')} rows={3} className="crm-input w-full resize-none" />
      </div>
      <button type="submit" disabled={saving} className="btn-crm-primary px-6 py-2 disabled:opacity-60">
        {saving ? 'Guardando…' : initial?.id ? 'Actualizar' : 'Crear contacto'}
      </button>
    </form>
  );
}
