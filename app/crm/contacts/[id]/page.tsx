import { db } from '@/lib/db';
import { contacts, activities, deals } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { ContactDetail } from '@/components/crm/contacts/ContactDetail';

export const dynamic = 'force-dynamic';

export default async function ContactPage({ params }: { params: { id: string } }) {
  const [contact] = await db.select().from(contacts).where(eq(contacts.id, params.id));
  if (!contact) notFound();

  const contactActivities = await db.select().from(activities).where(eq(activities.contactId, params.id));
  const contactDeals = await db.select().from(deals).where(eq(deals.contactId, params.id));

  return (
    <ContactDetail
      contact={{ ...contact, activities: contactActivities as any, deals: contactDeals as any } as any}
    />
  );
}
