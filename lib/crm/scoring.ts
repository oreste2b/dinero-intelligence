import type { Contact, Activity, Deal, LeadTemperature } from '@/types/crm';

interface ScoreInput {
  contact: Contact;
  activities?: Activity[];
  deals?: Deal[];
}

export interface ScoreResult {
  score: number;
  temperature: LeadTemperature;
}

export function scoreContact({ contact, activities = [], deals = [] }: ScoreInput): ScoreResult {
  let score = 0;

  // Temperature base
  if (contact.temperature === 'hot')  score += 40;
  if (contact.temperature === 'warm') score += 25;
  if (contact.temperature === 'cold') score += 10;

  // Contact completeness
  if (contact.email)   score += 10;
  if (contact.phone)   score += 10;
  if (contact.company) score += 5;

  // Engagement (capped at 20)
  score += Math.min(activities.length * 5, 20);

  // Recency penalty
  const allDates = activities
    .map(a => a.completedAt ?? a.scheduledAt ?? a.createdAt)
    .filter(Boolean) as string[];
  if (allDates.length > 0) {
    const latest = Math.max(...allDates.map(d => new Date(d).getTime()));
    const daysSince = (Date.now() - latest) / 86_400_000;
    if (daysSince > 30) score -= 15;
    else if (daysSince > 14) score -= 10;
    else if (daysSince > 7)  score -= 5;
  }

  // Deal bonus
  if (deals.length > 0) {
    score += 10;
    const maxValue = Math.max(...deals.map(d => d.value));
    if (maxValue > 500_000)  score += 10; // >5000 DKK
    else if (maxValue > 100_000) score += 5; // >1000 DKK
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  const temperature: LeadTemperature =
    score >= 70 ? 'hot' :
    score >= 40 ? 'warm' :
    'cold';

  return { score, temperature };
}
