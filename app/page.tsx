import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/config';

export const metadata: Metadata = {
  alternates: { canonical: `${SITE_URL}/invoice` },
};

export default function Home() {
  redirect('/invoice');
}
