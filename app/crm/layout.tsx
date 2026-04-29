import type { Metadata } from 'next';
import { CRMSidebar } from '@/components/crm/layout/CRMSidebar';

// CRM is an authenticated internal tool — never index these routes
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

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
