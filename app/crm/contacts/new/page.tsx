export const metadata = { title: 'Nuevo contacto' };

import { ContactForm } from '@/components/crm/contacts/ContactForm';

export default function NewContactPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Nuevo contacto</h1>
        <p className="text-slate-400 text-sm mt-1">Agrega un lead o cliente</p>
      </div>
      <ContactForm />
    </div>
  );
}
