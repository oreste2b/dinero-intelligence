import type { LeadTemperature, LeadSource, ActivityType } from '@/types/crm';

export const TEMPERATURE_CONFIG: Record<LeadTemperature, { label: string; color: string; bg: string }> = {
  hot:  { label: 'Caliente', color: '#ef4444', bg: '#fef2f2' },
  warm: { label: 'Tibio',    color: '#f97316', bg: '#fff7ed' },
  cold: { label: 'Frío',     color: '#6366f1', bg: '#eef2ff' },
};

export const SOURCE_LABELS: Record<LeadSource, string> = {
  website:  'Sitio web',
  referral: 'Referido',
  linkedin: 'LinkedIn',
  webinar:  'Webinar',
  whatsapp: 'WhatsApp',
  social:   'Redes sociales',
  otro:     'Otro',
  webhook:  'Webhook',
};

export const ACTIVITY_CONFIG: Record<ActivityType, { label: string; icon: string }> = {
  call:      { label: 'Llamada',      icon: 'Phone' },
  email:     { label: 'Correo',       icon: 'Mail' },
  meeting:   { label: 'Reunión',      icon: 'Calendar' },
  note:      { label: 'Nota',         icon: 'FileText' },
  follow_up: { label: 'Seguimiento',  icon: 'Bell' },
};

export function formatCurrency(cents: number, currency = 'DKK'): string {
  return new Intl.NumberFormat('da-DK', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('da-DK', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export function formatRelativeDate(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const days = Math.floor(ms / 86_400_000);
  if (days === 0) return 'Hoy';
  if (days === 1) return 'Ayer';
  if (days < 7)  return `Hace ${days} días`;
  if (days < 30) return `Hace ${Math.floor(days / 7)} sem.`;
  return formatDate(iso);
}
