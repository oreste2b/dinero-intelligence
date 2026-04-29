'use client';
import { TEMPERATURE_CONFIG } from '@/lib/crm/constants';
import type { LeadTemperature } from '@/types/crm';

export function StatusBadge({ temperature }: { temperature: LeadTemperature }) {
  const cfg = TEMPERATURE_CONFIG[temperature];
  return (
    <span
      style={{ color: cfg.color, background: cfg.bg }}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
    >
      {temperature === 'hot' ? '🔥' : temperature === 'warm' ? '☀️' : '❄️'}
      {cfg.label}
    </span>
  );
}
