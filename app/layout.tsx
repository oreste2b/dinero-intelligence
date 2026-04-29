import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { SITE_URL } from '@/lib/config';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Dinero Intelligence – AI-drevet regnskabsoverblik',
    template: '%s | Dinero Intelligence',
  },
  description:
    "Få overblik over din økonomi med AI-drevet analyse. Realtidsindsigt i udgifter, omsætning og moms – plus fuldt CRM til dine leads. Bygget til danske SMV'er på Dinero.dk.",
  keywords: [
    'regnskab dashboard',
    'AI regnskab',
    'Dinero.dk',
    'SMV økonomi',
    'faktura overblik',
    'moms beregning',
    'CRM Danmark',
    'iværksætter regnskab',
    'bogføring app',
    'regnskabsprogram',
  ],
  authors: [{ name: 'Dinero Intelligence', url: SITE_URL }],
  creator: 'Dinero Intelligence',
  openGraph: {
    type: 'website',
    locale: 'da_DK',
    url: SITE_URL,
    siteName: 'Dinero Intelligence',
    title: 'Dinero Intelligence – AI-drevet regnskabsoverblik',
    description:
      "Realtidsindsigt i udgifter, omsætning og moms. AI-analyse og CRM til dine leads – direkte koblet til Dinero.dk.",
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dinero Intelligence – AI-drevet regnskabsoverblik',
    description:
      "Realtidsindsigt i udgifter, omsætning og moms. AI-analyse og CRM – direkte koblet til Dinero.dk.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Dinero Intelligence',
      url: SITE_URL,
      description:
        "AI-drevet regnskabsdashboard og CRM til danske SMV'er bygget på Dinero.dk",
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${SITE_URL}/#app`,
      name: 'Dinero Intelligence',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description:
        "AI-drevet regnskabsoverblik og CRM til danske SMV'er. Realtidsindsigt i økonomi koblet til Dinero.dk.",
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'DKK',
      },
      author: { '@id': `${SITE_URL}/#organization` },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="da" className={jakarta.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
