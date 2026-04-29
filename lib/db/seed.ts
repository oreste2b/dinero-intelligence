import { db } from './index';
import { contacts, pipelineStages, deals, activities, crmSettings } from './schema';

const DEFAULT_STAGES = [
  { id: 'stage-1', name: 'Prospecto',        order: 1, color: '#6366f1', isWon: false, isLost: false },
  { id: 'stage-2', name: 'Contactado',       order: 2, color: '#8b5cf6', isWon: false, isLost: false },
  { id: 'stage-3', name: 'Propuesta',        order: 3, color: '#f59e0b', isWon: false, isLost: false },
  { id: 'stage-4', name: 'Negociación',      order: 4, color: '#f97316', isWon: false, isLost: false },
  { id: 'stage-5', name: 'Cerrado Ganado',   order: 5, color: '#10b981', isWon: true,  isLost: false },
  { id: 'stage-6', name: 'Cerrado Perdido',  order: 6, color: '#ef4444', isWon: false, isLost: true  },
];

export function seedStages() {
  const existing = db.select().from(pipelineStages).all();
  if (existing.length > 0) return;
  db.insert(pipelineStages).values(DEFAULT_STAGES).run();
}

export function seedDemo() {
  seedStages();

  const sampleContacts = [
    { id: 'c-1', name: 'María García',    email: 'maria@acme.dk',   phone: '+45 20 11 22 33', company: 'ACME ApS',        source: 'website',   temperature: 'hot',  score: 82, notes: 'Muy interesada en el plan Pro' },
    { id: 'c-2', name: 'Lars Andersen',   email: 'lars@norup.dk',   phone: '+45 31 44 55 66', company: 'Norup & Co.',     source: 'referral',  temperature: 'warm', score: 58, notes: null },
    { id: 'c-3', name: 'Sofía Martínez',  email: 'sofia@solo.dk',   phone: null,              company: 'Solo Consulting', source: 'linkedin',  temperature: 'cold', score: 25, notes: 'Contactar en Q3' },
    { id: 'c-4', name: 'Peter Nielsen',   email: 'peter@byg.dk',    phone: '+45 60 77 88 99', company: 'Byg & Anlæg',    source: 'webinar',   temperature: 'hot',  score: 91, notes: 'Demo realizada, pendiente firma' },
    { id: 'c-5', name: 'Emma Kristensen', email: 'emma@norden.com', phone: '+45 50 12 34 56', company: 'Norden A/S',     source: 'otro',      temperature: 'warm', score: 47, notes: null },
  ];

  const existing = db.select().from(contacts).all();
  if (existing.length === 0) {
    db.insert(contacts).values(sampleContacts).run();

    db.insert(deals).values([
      { id: 'd-1', title: 'ACME — Plan Pro Anual',    value: 1499900, stageId: 'stage-4', contactId: 'c-1', expectedClose: '2026-06-30', probability: 80, notes: null },
      { id: 'd-2', title: 'Norup — Onboarding Pack',  value: 450000,  stageId: 'stage-2', contactId: 'c-2', expectedClose: '2026-07-15', probability: 40, notes: null },
      { id: 'd-3', title: 'Byg — Enterprise License', value: 2999900, stageId: 'stage-3', contactId: 'c-4', expectedClose: '2026-05-31', probability: 65, notes: 'Pendiente revisión legal' },
    ]).run();

    db.insert(activities).values([
      { id: 'a-1', type: 'call',    description: 'Llamada inicial de descubrimiento', contactId: 'c-1', dealId: 'd-1', completedAt: '2026-04-10T10:00:00', createdAt: '2026-04-10T10:00:00' },
      { id: 'a-2', type: 'meeting', description: 'Demo del producto — 45 min',        contactId: 'c-4', dealId: 'd-3', completedAt: '2026-04-20T14:00:00', createdAt: '2026-04-20T14:00:00' },
      { id: 'a-3', type: 'email',   description: 'Propuesta enviada',                 contactId: 'c-2', dealId: 'd-2', completedAt: '2026-04-25T09:30:00', createdAt: '2026-04-25T09:30:00' },
      { id: 'a-4', type: 'follow_up', description: 'Seguimiento propuesta',           contactId: 'c-1', dealId: 'd-1', scheduledAt: '2026-05-02T11:00:00', createdAt: '2026-04-29T08:00:00' },
    ]).run();
  }

  db.insert(crmSettings).values([
    { key: 'currency', value: 'DKK' },
    { key: 'language', value: 'da' },
  ]).onConflictDoNothing().run();
}
