import { ContactsTable } from '@/components/crm/contacts/ContactsTable';

export const dynamic = 'force-dynamic';

export default function ContactsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Contactos</h1>
        <p className="text-slate-400 text-sm mt-1">Gestiona tus leads y clientes</p>
      </div>
      <ContactsTable />
    </div>
  );
}
