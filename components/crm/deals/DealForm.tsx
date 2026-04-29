'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { CreateDealPayload, PipelineStage, Contact } from '@/types/crm';

interface Props {
  initial?: Partial<CreateDealPayload> & { id?: string };
  onSaved?: () => void;
}

export function DealForm({ initial, onSaved }: Props) {
  const router = useRouter();
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [contactList, setContactList] = useState<Contact[]>([]);
  const [form, setForm] = useState<CreateDealPayload>({
    title:         initial?.title ?? '',
    value:         initial?.value ?? 0,
    stageId:       initial?.stageId ?? null,
    contactId:     initial?.contactId ?? null,
    expectedClose: initial?.expectedClose ?? '',
    probability:   initial?.probability ?? 0,
    notes:         initial?.notes ?? '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/crm/pipeline').then(r => r.json()).then(cols => setStages(cols.map((c: any) => c.stage)));
    fetch('/api/crm/contacts').then(r => r.json()).then(setContactList);
  }, []);

  const set = (k: keyof CreateDealPayload) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, value: Number(form.value) * 100 };
    const method  = initial?.id ? 'PUT' : 'POST';
    const url     = initial?.id ? `/api/crm/deals/${initial.id}` : '/api/crm/deals';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setSaving(false);
    onSaved?.();
    if (!initial?.id) router.push('/crm/deals');
  }

  return (
    <form onSubmit={submit} className="space-y-4 max-w-lg">
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Título *</label>
        <input required value={form.title} onChange={set('title')} className="crm-input w-full" placeholder="Nombre del negocio" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Valor (DKK)</label>
          <input type="number" min={0} value={(form.value ?? 0) / 100} onChange={e => setForm(f => ({ ...f, value: parseFloat(e.target.value) * 100 }))} className="crm-input w-full" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Probabilidad %</label>
          <input type="number" min={0} max={100} value={form.probability} onChange={set('probability')} className="crm-input w-full" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Etapa</label>
        <select value={form.stageId ?? ''} onChange={set('stageId')} className="crm-input w-full">
          <option value="">— Sin etapa —</option>
          {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Contacto</label>
        <select value={form.contactId ?? ''} onChange={set('contactId')} className="crm-input w-full">
          <option value="">— Sin contacto —</option>
          {contactList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Fecha de cierre estimada</label>
        <input type="date" value={form.expectedClose ?? ''} onChange={set('expectedClose')} className="crm-input w-full" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Notas</label>
        <textarea value={form.notes ?? ''} onChange={set('notes')} rows={3} className="crm-input w-full resize-none" />
      </div>
      <button type="submit" disabled={saving} className="btn-crm-primary px-6 py-2 disabled:opacity-60">
        {saving ? 'Guardando…' : initial?.id ? 'Actualizar' : 'Crear negocio'}
      </button>
    </form>
  );
}
