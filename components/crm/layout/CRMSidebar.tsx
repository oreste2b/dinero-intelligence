'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const NAV = [
  { href: '/crm',            label: 'Dashboard',  icon: '📊' },
  { href: '/crm/contacts',   label: 'Contactos',  icon: '👥' },
  { href: '/crm/pipeline',   label: 'Pipeline',   icon: '🏗️' },
  { href: '/crm/deals',      label: 'Negocios',   icon: '💼' },
  { href: '/crm/activities', label: 'Actividades', icon: '📋' },
];

export function CRMSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 bg-white border-r border-slate-100 flex flex-col py-6">
      <div className="px-5 mb-8">
        <span className="text-lg font-bold text-slate-800">CRM</span>
        <span className="text-xs text-slate-400 block">Dinero Intelligence</span>
      </div>

      <nav className="flex-1 space-y-0.5 px-2">
        {NAV.map(({ href, label, icon }) => {
          const active = pathname === href || (href !== '/crm' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              )}
            >
              <span className="text-base leading-none">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 mt-auto">
        <Link href="/invoice" className="text-xs text-slate-400 hover:text-slate-600">
          ← Volver a Dinero
        </Link>
      </div>
    </aside>
  );
}
