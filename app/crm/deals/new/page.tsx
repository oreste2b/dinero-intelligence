import { DealForm } from '@/components/crm/deals/DealForm';

export default function NewDealPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Nuevo negocio</h1>
        <p className="text-slate-400 text-sm mt-1">Agrega un negocio a tu pipeline</p>
      </div>
      <DealForm />
    </div>
  );
}
