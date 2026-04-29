import { CRMSidebar } from '@/components/crm/layout/CRMSidebar';

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="crm-root flex h-screen overflow-hidden bg-slate-50">
      <CRMSidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
