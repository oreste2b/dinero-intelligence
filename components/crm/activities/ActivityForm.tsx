'use client';
import { useState } from 'react';
import type { Activity, ActivityType, CreateActivityPayload } from '@/types/crm';
import { ACTIVITY_CONFIG } from '@/lib/crm/constants';

interface Props {
  contactId?: string;
  dealId?: string;
  onCreated?: (a: Activity) => void;
}

export function ActivityForm({ contactId, dealId, onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateActivityPayload>({
    type: 'call', description: '', contactId: contactId ?? null, dealId: dealId ?? null, scheduledAt: null,
  });
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/crm/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const created = await res.json();
    setSaving(false);
    setOpen(false);
    setForm({ type: 'call', description: '', contactId: contactId ?? null, dealId: dealId ?? null, scheduledAt: null });
    onCreated?.(created);
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-crm-secondary text-sm px-4 py-2 w-full">
        + Registrar actividad
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="crm-card p-4 space-y-3">
      <div className="flex gap-2 flex-wrap">
        {(Object.entries(ACTIVITY_CONFIG) as [ActivityType, { label: string }][]).map(([type, cfg]) => (
          <button
            key={type}
            type="button"
            onClick={() => setForm(f => ({ ...f, type }))}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              form.type === type ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cfg.label}
          </button>
        ))}
      </div>
      <textarea
        required
        value={form.description}
        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
        rows={2}
        className="crm-input w-full resize-none"
        placeholder="Descripción de la actividad…"
      />
      <div>
        <label className="block text-xs text-slate-400 mb-1">Programar para</label>
        <input
          type="datetime-local"
          value={form.scheduledAt ?? ''}
          onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value || null }))}
          className="crm-input w-full"
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="btn-crm-primary px-4 py-1.5 text-sm disabled:opacity-60">
          {saving ? 'Guardando…' : 'Guardar'}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn-crm-secondary px-4 py-1.5 text-sm">
          Cancelar
        </button>
      </div>
    </form>
  );
}
