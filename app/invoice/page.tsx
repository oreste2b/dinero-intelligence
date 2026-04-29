import type { Metadata } from 'next';
import InvoiceDashboard from '@/components/InvoiceDashboard';
import { SITE_URL } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Regnskabsoverblik – Udgifter, Omsætning & Moms',
  description:
    "Se dine udgifter, omsætning og moms i realtid med AI-analyse. Automatisk kategorisering, momsberegning og handlingsforslag – koblet direkte til din Dinero.dk-konto.",
  alternates: {
    canonical: `${SITE_URL}/invoice`,
  },
  openGraph: {
    title: 'Dinero Intelligence – Regnskabsoverblik',
    description:
      "Realtidsindsigt i udgifter, omsætning og moms med AI-analyse koblet til Dinero.dk.",
    url: `${SITE_URL}/invoice`,
  },
};

export default function InvoicePage() {
  return (
    <>
      {/* Server-rendered h1 for crawlers — visually hidden, not deceptive */}
      <h1 className="sr-only">
        Dinero Intelligence – AI-drevet regnskabsoverblik for danske SMV&apos;er
      </h1>
      <InvoiceDashboard />
    </>
  );
}
