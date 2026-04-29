'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutGrid, ArrowLeft, Building2, RefreshCw, BarChart2, Settings,
  Search, Hourglass, Sparkles, TrendingUp, TrendingDown,
  SlidersHorizontal, List, LayoutDashboard, MoreHorizontal,
  Zap, Check, Calendar, Mail, ArrowUpRight, ChevronDown,
  Users, GitBranch, Activity, Download, Upload, Webhook, Bot,
  LogOut, User, X,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Palette  = 'mint' | 'sky' | 'peach' | 'butter' | 'dusk';
type Density  = 'comfortable' | 'compact';
type ViewMode = 'grid' | 'list' | 'slim';
type Filter   = 'all' | 'alerts' | 'tips' | 'done';
type Trend    = 'up' | 'down' | 'ok' | 'alert' | 'flat';

interface Item {
  id: number; name: string; subtitle: string; amount: number;
  qty: number; loc: string; trend: string; trendKind: Trend;
  thumb: keyof typeof THUMBS;
}
interface Activity {
  id: number; kind: 'moms' | 'action' | 'alert' | 'tip';
  color: string; iconColor: string; tag: string;
  title: string; sub: string; cta: string;
}

// ─── Static data ──────────────────────────────────────────────────────────────

const ITEMS: Item[] = [
  { id:1, name:'Kørselsgodtgørelse', subtitle:'Mileage allowance',      amount:2840.50, qty:18, loc:'Trips',     trend:'+5% vs marts',    trendKind:'up',    thumb:'car'      },
  { id:2, name:'Husleje',            subtitle:'Rent · warehouse',       amount:8500.00, qty:1,  loc:'Monthly',   trend:'Stable',          trendKind:'flat',  thumb:'building' },
  { id:3, name:'Varekøb',            subtitle:'Materials · paint',      amount:6420.75, qty:24, loc:'Suppliers', trend:'Within budget',   trendKind:'ok',    thumb:'bolt'     },
  { id:4, name:'Unreconciled',       subtitle:'Bank discrepancy',       amount:4309.91, qty:3,  loc:'Danske',    trend:'Action required', trendKind:'alert', thumb:'alert'    },
  { id:5, name:'Repræsentation',     subtitle:'Client meetings',        amount:1245.00, qty:6,  loc:'Q2',        trend:'-12% vs marts',   trendKind:'down',  thumb:'envelope' },
  { id:6, name:'Kontorartikler',     subtitle:'Office supplies',        amount:432.10,  qty:9,  loc:'Misc',      trend:'Within budget',   trendKind:'ok',    thumb:'note'     },
];

const ACTIVITIES: Activity[] = [
  { id:1, kind:'moms',   color:'linear-gradient(135deg,#e2d6f5,#c8b6e8)', iconColor:'#5b3fa6', tag:'Moms',   title:'Moms payment due in 33 days',     sub:'You have enough cash in Danske Business One to cover 3.045,00 DKK.',         cta:'Schedule payment' },
  { id:2, kind:'action', color:'linear-gradient(135deg,#ffd9bc,#ffb98a)', iconColor:'#a8521f', tag:'Action', title:'3 receipts found in Gmail',         sub:'Potential matches for the 4.309,91 DKK bank discrepancy. Review now.',       cta:'Review matches'   },
  { id:3, kind:'alert',  color:'linear-gradient(135deg,#ffeea0,#f6d46a)', iconColor:'#8a6a14', tag:'Alert',  title:'Expenses exceed revenue',           sub:'Udgifter 22.347 DKK > Omsætning 17.845 DKK. Check Varekøb for overstock.', cta:'Open report'      },
  { id:4, kind:'tip',    color:'linear-gradient(135deg,#c4ebc9,#8fdca0)', iconColor:'#1f6a3a', tag:'Tip',    title:'Deduct 1.000 DKK more',             sub:'Forskudsopgørelse can be adjusted based on current trend.',                  cta:'Adjust forskud'   },
];

// ─── SVG thumbnails ───────────────────────────────────────────────────────────

const THUMBS = {
  car: () => (
    <svg viewBox="0 0 64 64" width="40" height="40" aria-hidden>
      <path d="M10 38l4-12a4 4 0 0 1 4-3h28a4 4 0 0 1 4 3l4 12v8H10v-8z" fill="#cbd6e8" stroke="#3a4452" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M16 38h32" stroke="#3a4452" strokeWidth="1.2"/>
      <circle cx="20" cy="46" r="4" fill="#1f242b"/><circle cx="44" cy="46" r="4" fill="#1f242b"/>
      <rect x="20" y="28" width="9" height="7" rx="1" fill="#e7eef7"/>
      <rect x="35" y="28" width="9" height="7" rx="1" fill="#e7eef7"/>
    </svg>
  ),
  building: () => (
    <svg viewBox="0 0 64 64" width="40" height="40" aria-hidden>
      <rect x="14" y="10" width="36" height="44" rx="2" fill="#cbd6e8" stroke="#3a4452" strokeWidth="1.4"/>
      <g fill="#3a4452">
        <rect x="20" y="16" width="6" height="6" rx="1"/><rect x="29" y="16" width="6" height="6" rx="1"/>
        <rect x="38" y="16" width="6" height="6" rx="1"/><rect x="20" y="26" width="6" height="6" rx="1"/>
        <rect x="29" y="26" width="6" height="6" rx="1"/><rect x="38" y="26" width="6" height="6" rx="1"/>
        <rect x="20" y="36" width="6" height="6" rx="1"/><rect x="38" y="36" width="6" height="6" rx="1"/>
      </g>
      <rect x="28" y="42" width="8" height="12" rx="1" fill="#5d6b7e"/>
    </svg>
  ),
  bolt: () => (
    <svg viewBox="0 0 64 64" width="40" height="40" aria-hidden>
      <rect x="12" y="14" width="40" height="36" rx="3" fill="#f0e3c8" stroke="#8a6a14" strokeWidth="1.4"/>
      <path d="M12 22h40" stroke="#8a6a14" strokeWidth="1.2"/>
      <path d="M34 26l-8 12h6l-2 8 8-12h-6l2-8z" fill="#f5b921" stroke="#8a6a14" strokeWidth="1.2" strokeLinejoin="round"/>
    </svg>
  ),
  alert: () => (
    <svg viewBox="0 0 64 64" width="40" height="40" aria-hidden>
      <path d="M32 10l24 42H8z" fill="#ffd2c2" stroke="#a8521f" strokeWidth="1.6" strokeLinejoin="round"/>
      <rect x="30.5" y="24" width="3" height="14" rx="1.5" fill="#a8521f"/>
      <circle cx="32" cy="44" r="2" fill="#a8521f"/>
    </svg>
  ),
  envelope: () => (
    <svg viewBox="0 0 64 64" width="40" height="40" aria-hidden>
      <rect x="10" y="18" width="44" height="30" rx="3" fill="#f5d4dc" stroke="#a8425e" strokeWidth="1.4"/>
      <path d="M10 22l22 16 22-16" fill="none" stroke="#a8425e" strokeWidth="1.4"/>
    </svg>
  ),
  note: () => (
    <svg viewBox="0 0 64 64" width="40" height="40" aria-hidden>
      <path d="M16 8h22l10 10v38H16z" fill="#e6dff2" stroke="#5b3fa6" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M38 8v10h10" fill="none" stroke="#5b3fa6" strokeWidth="1.4"/>
      <path d="M22 28h20M22 34h20M22 40h14" stroke="#5b3fa6" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
};

// ─── Utilities ────────────────────────────────────────────────────────────────

function dkk(n: number) {
  const neg = n < 0;
  const [int, dec] = Math.abs(n).toFixed(2).split('.');
  return (neg ? '-' : '') + int.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + dec;
}

function toast(text: string) {
  const el = Object.assign(document.createElement('div'), { textContent: text });
  Object.assign(el.style, {
    position:'fixed', bottom:'24px', left:'50%', transform:'translateX(-50%)',
    background:'#0c0e10', color:'#fff', padding:'10px 16px', borderRadius:'999px',
    fontSize:'13px', fontFamily:'inherit', zIndex:'9999', whiteSpace:'nowrap',
    boxShadow:'0 8px 24px rgba(0,0,0,.25)', opacity:'0', transition:'opacity .18s ease',
  });
  document.body.appendChild(el);
  requestAnimationFrame(() => { el.style.opacity = '1'; });
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 220); }, 1400);
}

// ─── Style shortcuts ──────────────────────────────────────────────────────────

const neo     = { background:'var(--surface)', borderRadius:22, boxShadow:'var(--shadow-out)' } as React.CSSProperties;
const neoSm   = { background:'var(--surface)', borderRadius:14, boxShadow:'var(--shadow-sm)'  } as React.CSSProperties;
const neoPill = { background:'var(--surface)', borderRadius:999, boxShadow:'var(--shadow-pill)'} as React.CSSProperties;
const neoIn   = { background:'var(--surface)', borderRadius:999, boxShadow:'var(--shadow-in)' } as React.CSSProperties;

// ─── ToolsDropdown ────────────────────────────────────────────────────────────

const TOOLS = [
  { icon: <LayoutDashboard size={16} strokeWidth={1.6}/>, label: 'Financial Overview', sub: 'Overblik · DKK', href: '/invoice' },
  { icon: <Users           size={16} strokeWidth={1.6}/>, label: 'CRM',                sub: 'Contacts & leads', href: '/crm' },
  { icon: <GitBranch       size={16} strokeWidth={1.6}/>, label: 'Pipeline',           sub: 'Sales stages',    href: '/crm/pipeline' },
  { icon: <Activity        size={16} strokeWidth={1.6}/>, label: 'Actividades',         sub: 'Tasks & calls',   href: '/crm/activities' },
  { icon: <Download        size={16} strokeWidth={1.6}/>, label: 'Exportar CSV',       sub: 'All contacts',    href: '/api/crm/contacts?format=csv' },
  { icon: <Upload          size={16} strokeWidth={1.6}/>, label: 'Importar CSV',       sub: 'Bulk import',     href: '/crm/contacts' },
  { icon: <Webhook         size={16} strokeWidth={1.6}/>, label: 'Webhook',            sub: 'Copy endpoint',   href: null },
  { icon: <Bot             size={16} strokeWidth={1.6}/>, label: 'AI Advisor',         sub: 'Analyze books',   href: null },
];

function ToolsDropdown({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  function handleTool(t: typeof TOOLS[0]) {
    onClose();
    if (t.href === null) {
      if (t.label === 'Webhook') {
        const url = `${window.location.origin}/api/crm/webhook`;
        navigator.clipboard.writeText(url).then(() => toast('Webhook URL copiado ✓'));
      } else {
        toast('AI Advisor: analizando tus libros…');
      }
    } else {
      router.push(t.href);
    }
  }

  return (
    <div ref={ref} style={{ ...neo, position:'absolute', top:'calc(100% + 8px)', left:0, width:260, borderRadius:20, padding:'10px 8px', zIndex:200 }}>
      <div style={{ padding:'6px 10px 8px', fontSize:10, fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', color:'var(--ink-3)' }}>Herramientas del sistema</div>
      {TOOLS.map(t => (
        <button key={t.label} onClick={() => handleTool(t)} style={{ display:'flex', alignItems:'center', gap:12, width:'100%', padding:'9px 10px', borderRadius:12, border:0, background:'transparent', cursor:'pointer', textAlign:'left', fontFamily:'inherit', transition:'background .12s' }}
          onMouseEnter={e => (e.currentTarget.style.background='rgba(0,0,0,.04)')}
          onMouseLeave={e => (e.currentTarget.style.background='transparent')}
        >
          <div style={{ width:34, height:34, borderRadius:10, background:'var(--surface)', boxShadow:'var(--shadow-sm)', display:'flex', alignItems:'center', justifyContent:'center', flex:'none', color:'var(--ink-2)' }}>{t.icon}</div>
          <div style={{ display:'flex', flexDirection:'column', lineHeight:1.2, minWidth:0 }}>
            <span style={{ fontSize:13, fontWeight:600, color:'var(--ink)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{t.label}</span>
            <span style={{ fontSize:11, color:'var(--ink-3)' }}>{t.sub}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

// ─── ProfileDropdown ──────────────────────────────────────────────────────────

function ProfileDropdown({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div ref={ref} style={{ ...neo, position:'absolute', top:'calc(100% + 8px)', right:0, width:280, borderRadius:20, padding:'6px 0 8px', zIndex:200 }}>
      {/* Avatar + name */}
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px 12px' }}>
        <div style={{ width:44, height:44, borderRadius:999, background:'radial-gradient(circle at 35% 35%,#ffd5b3,#c98a5c 60%,#6e3a1a)', boxShadow:'var(--shadow-pill)', position:'relative', overflow:'hidden', flex:'none' }}>
          <svg viewBox="0 0 42 42" width="44" height="44" style={{ position:'absolute', inset:0 }}>
            <ellipse cx="21" cy="34" rx="11" ry="8" fill="#3a2418" opacity=".55"/>
            <circle cx="16" cy="20" r="1.4" fill="#1c1208"/><circle cx="26" cy="20" r="1.4" fill="#1c1208"/>
            <path d="M16 26q5 4 10 0" stroke="#3a2418" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
          </svg>
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontWeight:700, fontSize:14, color:'var(--ink)', letterSpacing:'-.01em' }}>Orestes Baratutí</div>
          <div style={{ fontSize:11, color:'var(--ink-3)', marginTop:1 }}>oreste2b@gmail.com</div>
        </div>
        <button onClick={onClose} style={{ width:28, height:28, borderRadius:999, border:0, background:'transparent', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--ink-3)' }}><X size={14} strokeWidth={1.7}/></button>
      </div>
      {/* Divider */}
      <div style={{ height:1, background:'var(--line)', margin:'0 12px 6px' }}/>
      {/* Info rows */}
      {[
        { label:'Plan',         value:'Pro' },
        { label:'Empresa',      value:'Dinero Intelligence' },
        { label:'Año fiscal',   value:'2026' },
        { label:'Moms vence',   value:'01 Jun 2026' },
      ].map(r => (
        <div key={r.label} style={{ display:'flex', justifyContent:'space-between', padding:'6px 16px', fontSize:12 }}>
          <span style={{ color:'var(--ink-3)', fontWeight:500 }}>{r.label}</span>
          <span style={{ color:'var(--ink)', fontWeight:600 }}>{r.value}</span>
        </div>
      ))}
      {/* Dinero.dk status */}
      <div style={{ margin:'8px 12px', padding:'8px 12px', borderRadius:12, background:'rgba(155,232,169,.35)', display:'flex', alignItems:'center', gap:8 }}>
        <div style={{ width:8, height:8, borderRadius:999, background:'#1f6a3a' }}/>
        <span style={{ fontSize:11, fontWeight:600, color:'#1f6a3a' }}>Conectado a Dinero.dk</span>
      </div>
      {/* Divider */}
      <div style={{ height:1, background:'var(--line)', margin:'6px 12px' }}/>
      {/* Actions */}
      <button onClick={() => { onClose(); toast('Opening settings…'); }} style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'9px 16px', border:0, background:'transparent', cursor:'pointer', fontSize:13, fontFamily:'inherit', color:'var(--ink)', fontWeight:500 }}
        onMouseEnter={e => (e.currentTarget.style.background='rgba(0,0,0,.04)')}
        onMouseLeave={e => (e.currentTarget.style.background='transparent')}
      ><User size={15} strokeWidth={1.6}/> Configuración de cuenta</button>
      <button onClick={() => { onClose(); toast('Cerrando sesión…'); }} style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'9px 16px', border:0, background:'transparent', cursor:'pointer', fontSize:13, fontFamily:'inherit', color:'#c4502f', fontWeight:500 }}
        onMouseEnter={e => (e.currentTarget.style.background='rgba(196,80,47,.06)')}
        onMouseLeave={e => (e.currentTarget.style.background='transparent')}
      ><LogOut size={15} strokeWidth={1.6}/> Cerrar sesión</button>
    </div>
  );
}

// ─── InvoiceHeader ────────────────────────────────────────────────────────────

function InvoiceHeader({ onSync, syncing, onAction, onBack, onSearch, showTools, setShowTools, showProfile, setShowProfile }: {
  onSync: () => void; syncing: boolean; onAction: (k: string) => void;
  onBack: () => void; onSearch: () => void;
  showTools: boolean; setShowTools: (v: boolean) => void;
  showProfile: boolean; setShowProfile: (v: boolean) => void;
}) {
  return (
    <header style={{ display:'flex', alignItems:'center', gap:18, justifyContent:'space-between', padding:'10px 6px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:18 }}>
        <div style={{ ...neoPill, width:48, height:48, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:18, letterSpacing:'-.02em' }}>dkr</div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {/* Tools button with dropdown */}
          <div style={{ position:'relative' }}>
            <button className="inv-btn" onClick={() => { setShowTools(!showTools); setShowProfile(false); }} style={{ width:42, height:42, padding:0, justifyContent:'center', boxShadow: showTools ? 'var(--shadow-in)' : undefined }} aria-label="Apps"><LayoutGrid size={18} strokeWidth={1.6}/></button>
            {showTools && <ToolsDropdown onClose={() => setShowTools(false)}/>}
          </div>
          <button className="inv-btn" onClick={onBack} style={{ width:42, height:42, padding:0, justifyContent:'center' }} aria-label="Back"><ArrowLeft size={18} strokeWidth={1.6}/></button>
          <div className="inv-btn" style={{ paddingLeft:14, cursor:'default' }}>
            <Building2 size={18} strokeWidth={1.6}/>
            <span style={{ fontSize:15, fontWeight:600, letterSpacing:'-.01em' }}>Overblik</span>
            <span style={{ fontSize:11, color:'var(--ink-3)', fontWeight:500, marginLeft:4, paddingLeft:10, borderLeft:'1px solid var(--line)' }}>Financial Overview</span>
          </div>
        </div>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:14 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <button className="inv-btn" onClick={onSync}>
            <RefreshCw size={18} strokeWidth={1.6} className={syncing ? 'inv-spin' : ''}/>
            {syncing ? 'Syncing…' : 'Sync Dinero.dk'}
          </button>
          <button className="inv-btn" onClick={() => onAction('reports')}><BarChart2 size={18} strokeWidth={1.6}/> Reports</button>
          <button className="inv-btn" onClick={() => onAction('settings')}><Settings size={18} strokeWidth={1.6}/> Settings</button>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {/* Avatar with profile dropdown */}
          <div style={{ position:'relative' }}>
            <button onClick={() => { setShowProfile(!showProfile); setShowTools(false); }} style={{ width:42, height:42, borderRadius:999, background:'radial-gradient(circle at 35% 35%,#ffd5b3,#c98a5c 60%,#6e3a1a)', boxShadow: showProfile ? 'var(--shadow-in)' : 'var(--shadow-pill)', position:'relative', overflow:'hidden', border:0, cursor:'pointer', padding:0 }} aria-label="Profile">
              <svg viewBox="0 0 42 42" width="42" height="42" style={{ position:'absolute', inset:0 }}>
                <ellipse cx="21" cy="34" rx="11" ry="8" fill="#3a2418" opacity=".55"/>
                <circle cx="16" cy="20" r="1.4" fill="#1c1208"/><circle cx="26" cy="20" r="1.4" fill="#1c1208"/>
                <path d="M16 26q5 4 10 0" stroke="#3a2418" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
              </svg>
            </button>
            {showProfile && <ProfileDropdown onClose={() => setShowProfile(false)}/>}
          </div>
          <button className="inv-btn" onClick={onSearch} style={{ width:42, height:42, padding:0, justifyContent:'center' }} aria-label="Search"><Search size={18} strokeWidth={1.6}/></button>
        </div>
      </div>
    </header>
  );
}

// ─── InvoiceSummary ───────────────────────────────────────────────────────────

function MetaPill({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color?: string }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, padding:'6px 10px' }}>
      <div style={{ ...neoPill, width:42, height:42, display:'flex', alignItems:'center', justifyContent:'center' }}>{icon}</div>
      <div style={{ display:'flex', flexDirection:'column', lineHeight:1.15 }}>
        <span style={{ fontSize:11, color:'var(--ink-3)', letterSpacing:'.02em' }}>{label}</span>
        <span style={{ fontSize:15, fontWeight:600, color: color || 'var(--ink)', letterSpacing:'-.01em' }}>{value}</span>
      </div>
    </div>
  );
}

function Chip({ bg, icon, label, value, sub }: { bg: string; icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <div style={{ flex:1, display:'flex', alignItems:'center', gap:14, background:bg, borderRadius:18, padding:'14px 18px', minHeight:64, boxShadow:'inset 2px 2px 6px rgba(255,255,255,.5),inset -2px -2px 6px rgba(0,0,0,.04)', position:'relative' }}>
      <div style={{ width:36, height:36, borderRadius:999, background:'rgba(255,255,255,.7)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'2px 2px 5px rgba(0,0,0,.08),-2px -2px 5px rgba(255,255,255,.7)' }}>{icon}</div>
      <div style={{ display:'flex', flexDirection:'column', lineHeight:1.1, flex:1, minWidth:0, position:'relative' }}>
        <span style={{ position:'absolute', top:-26, left:0, fontSize:11, color:'var(--ink-3)', letterSpacing:'.02em' }}>{label}</span>
        <span className="inv-tabular" style={{ fontWeight:700, fontSize:20, letterSpacing:'-.02em', color:'var(--ink)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{value}</span>
        <span style={{ fontSize:10, color:'var(--ink-2)', marginTop:1 }}>{sub}</span>
      </div>
    </div>
  );
}

function InvoiceSummary({ resultat, onAskAI }: { resultat: number; onAskAI: () => void }) {
  const neg = resultat < 0;
  const fmt = dkk(resultat);
  const m = fmt.match(/^(-?[\d.]+),(\d{2})$/);
  const intPart = m ? m[1] : fmt;
  const decPart = m ? m[2] : '00';

  return (
    <section style={{ ...neo, marginTop:20, padding:'28px 30px 24px', borderRadius:28 }}>
      <div style={{ display:'flex', alignItems:'center', gap:24, flexWrap:'wrap' }}>
        {/* Hero amount */}
        <div style={{ display:'flex', alignItems:'center', gap:18, flex:'1 1 460px' }}>
          <div style={{ width:72, height:72, borderRadius:999, background:'var(--surface)', boxShadow:'var(--shadow-in)', display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
            <Sparkles size={22} strokeWidth={1.6} color={neg ? '#c4502f' : '#2a8a55'}/>
            {neg && <div style={{ position:'absolute', inset:-2, borderRadius:999, boxShadow:'0 0 24px rgba(220,90,70,.45),0 0 50px rgba(220,90,70,.18)', pointerEvents:'none' }}/>}
          </div>
          <div style={{ display:'flex', alignItems:'baseline', gap:8 }}>
            <span className={`inv-tabular${neg ? ' inv-neg-aura' : ''}`} style={{ fontWeight:800, fontSize:60, lineHeight:1, letterSpacing:'-.045em', color: neg ? '#c4502f' : 'var(--ink)' }}>{intPart}</span>
            <span className="inv-tabular" style={{ fontWeight:700, fontSize:22, color: neg ? 'rgba(196,80,47,.65)' : 'var(--ink-3)', letterSpacing:'-.02em' }}>,{decPart}</span>
            <span style={{ fontWeight:700, fontSize:18, color:'var(--ink-2)', letterSpacing:'-.01em', marginLeft:6, alignSelf:'flex-end', paddingBottom:8 }}>DKK</span>
            <div style={{ display:'flex', flexDirection:'column', marginLeft:14, alignSelf:'center' }}>
              <span style={{ fontSize:11, color:'var(--ink-3)', letterSpacing:'.06em', textTransform:'uppercase' }}>Resultat</span>
              <span style={{ fontSize:13, color: neg ? '#c4502f' : 'var(--ink-2)', fontWeight:600, marginTop:2 }}>{neg ? 'Below break-even' : 'On track'}</span>
            </div>
          </div>
        </div>
        {/* Meta pills */}
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          <MetaPill icon={<Building2 size={18} strokeWidth={1.6}/>} label="Fiscal Year" value="2026"/>
          <MetaPill icon={<Hourglass size={18} strokeWidth={1.6}/>} label="Vat Due" value="01. Jun"/>
          <MetaPill icon={<Sparkles size={18} strokeWidth={1.6} color="#5b3fa6"/>} label="AI Status" value="Analyzing discrepancies" color="#5b3fa6"/>
        </div>
      </div>

      {/* Financial chips */}
      <div style={{ display:'flex', gap:14, marginTop:40, alignItems:'stretch' }}>
        <Chip bg="linear-gradient(135deg,#bff0c8,#9be8a9)" icon={<TrendingUp size={18} strokeWidth={1.6} color="#1f6a3a"/>} label="Omsætning" value={dkk(17845)+' DKK'} sub="Revenue"/>
        <Chip bg="linear-gradient(135deg,#ffeea0,#ffd86b)" icon={<TrendingDown size={18} strokeWidth={1.6} color="#8a6a14"/>} label="Udgifter" value={dkk(22347.25)+' DKK'} sub="Expenses"/>
        <Chip bg="linear-gradient(135deg,#cfe1f7,#a8c6ed)" icon={<Hourglass size={18} strokeWidth={1.6} color="#2c4a7a"/>} label="Tax Reserve" value={dkk(3045)+' DKK'} sub="Moms"/>
        {/* CTA strip */}
        <div style={{ flex:1.2, display:'flex', alignItems:'center', gap:10, padding:6, borderRadius:20, position:'relative' }}>
          <div className="inv-stripes" style={{ position:'absolute', inset:0, borderRadius:20, opacity:.5, pointerEvents:'none' }}/>
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'flex-end', padding:'10px 18px', position:'relative' }}>
            <span style={{ fontSize:12, color:'var(--ink-3)' }}>Moms in</span>
            <span className="inv-tabular" style={{ marginLeft:10, fontWeight:700, fontSize:18, letterSpacing:'-.01em' }}>33</span>
            <span style={{ marginLeft:6, color:'var(--ink-3)', fontSize:12 }}>days</span>
          </div>
          <button className="inv-btn inv-btn-dark" onClick={onAskAI} style={{ padding:'14px 22px', fontSize:14, gap:8, position:'relative' }}>
            <Sparkles size={18} strokeWidth={1.6}/> Ask AI Advisor
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── InvoiceLines ─────────────────────────────────────────────────────────────

function trendStyle(k: Trend) {
  const s = {
    up:    { color:'#1f6a3a', bg:'rgba(155,232,169,.45)', icon:<TrendingUp  size={14} strokeWidth={1.7} color="#1f6a3a"/> },
    down:  { color:'#1f6a3a', bg:'rgba(155,232,169,.45)', icon:<TrendingDown size={14} strokeWidth={1.7} color="#1f6a3a"/> },
    ok:    { color:'#2c4a7a', bg:'rgba(208,225,247,.55)', icon:<Check        size={14} strokeWidth={1.7} color="#2c4a7a"/> },
    alert: { color:'#a8521f', bg:'rgba(255,213,178,.6)',  icon:<Zap          size={14} strokeWidth={1.7} color="#a8521f"/> },
    flat:  { color:'var(--ink-2)', bg:'rgba(232,232,232,.6)', icon: null },
  };
  return s[k] ?? s.flat;
}

function CategoryCard({ item }: { item: Item }) {
  const t = trendStyle(item.trendKind);
  const isAlert = item.trendKind === 'alert';
  const Thumb = THUMBS[item.thumb];
  return (
    <div className="inv-cat-card" style={{ display:'flex', flexDirection:'column', gap:14, padding:18, borderRadius:22, background:'var(--surface)', boxShadow: isAlert ? 'var(--shadow-sm),0 0 0 1.5px rgba(196,90,47,.35)' : 'var(--shadow-sm)', minHeight:148, position:'relative' }}>
      <div style={{ display:'flex', alignItems:'flex-start', gap:14 }}>
        <div style={{ width:60, height:60, borderRadius:14, flex:'none', background:'linear-gradient(145deg,#efece6,#dcd8d0)', boxShadow:'inset 2px 2px 5px rgba(133,148,160,.18),inset -2px -2px 5px rgba(255,255,255,.9)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Thumb/>
        </div>
        <div style={{ display:'flex', flexDirection:'column', lineHeight:1.2, flex:1, minWidth:0 }}>
          <span style={{ fontWeight:700, fontSize:16, letterSpacing:'-.01em', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.name}</span>
          <span style={{ fontSize:12, color:'var(--ink-3)', marginTop:3, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.subtitle}</span>
          <span className="inv-tabular" style={{ fontWeight:800, fontSize:18, letterSpacing:'-.02em', marginTop:6, color: isAlert ? '#c4502f' : 'var(--ink)' }}>
            {dkk(item.amount)} <span style={{ fontSize:11, color:'var(--ink-3)', fontWeight:500 }}>DKK</span>
          </span>
        </div>
      </div>
      <div className="inv-hairline"/>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 10px', borderRadius:999, background:t.bg, color:t.color, fontSize:11, fontWeight:600 }}>
          {t.icon}{item.trend}
        </div>
        <span style={{ fontSize:11, color:'var(--ink-3)', marginLeft:'auto' }}>{item.loc}</span>
        <MoreHorizontal size={14} strokeWidth={1.7} color="var(--ink-3)"/>
      </div>
    </div>
  );
}

function InvoiceLines() {
  const [tab, setTab] = useState('Categories');
  const [view, setView] = useState<ViewMode>('grid');
  const [q, setQ] = useState('');
  const items = ITEMS.filter(i => !q || i.name.toLowerCase().includes(q.toLowerCase()) || i.subtitle.toLowerCase().includes(q.toLowerCase()));
  const views: { id: ViewMode; icon: React.ReactNode }[] = [
    { id:'grid', icon:<LayoutDashboard size={18} strokeWidth={1.6}/> },
    { id:'list', icon:<List            size={18} strokeWidth={1.6}/> },
    { id:'slim', icon:<SlidersHorizontal size={18} strokeWidth={1.6}/> },
  ];
  return (
    <section style={{ ...neo, flex:'1 1 0', minWidth:0, padding:'26px 28px 28px', borderRadius:28 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:18 }}>
        <div>
          <h2 style={{ margin:0, fontSize:24, fontWeight:700, letterSpacing:'-.03em', color:'var(--ink)' }}>Top Expense Categories</h2>
          <div style={{ fontSize:12, color:'var(--ink-3)', marginTop:4 }}>April · Konti from Dinero.dk</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {['Categories','Konti','Notes'].map(t => (
            <button key={t} onClick={() => setTab(t)} className="inv-btn" style={{ padding:'10px 18px', background: tab===t ? 'var(--surface)' : 'transparent', boxShadow: tab===t ? 'var(--shadow-pill)' : 'inset 2px 2px 6px rgba(133,148,160,.15),inset -2px -2px 6px rgba(255,255,255,.7)', color: tab===t ? 'var(--ink)' : 'var(--ink-2)', fontWeight: tab===t ? 700 : 600 }}>{t}</button>
          ))}
        </div>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:18, marginTop:18 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ fontWeight:800, fontSize:38, letterSpacing:'-.03em', lineHeight:1, color:'var(--ink)' }}>{ITEMS.length}</span>
          <span style={{ fontSize:13, color:'var(--ink-3)' }}>active</span>
        </div>
        <div style={{ ...neoIn, flex:1, display:'flex', alignItems:'center', gap:10, padding:'10px 18px' }}>
          <Search size={18} strokeWidth={1.6} color="var(--ink-3)"/>
          <input id="inv-search" value={q} onChange={e => setQ(e.target.value)} placeholder="Search transactions or accounts" style={{ flex:1, border:0, outline:'none', background:'transparent', fontSize:14, fontFamily:'inherit', color:'var(--ink)' }}/>
        </div>
        <div style={{ ...neoIn, display:'flex', padding:5, gap:4 }}>
          {views.map(o => (
            <button key={o.id} onClick={() => setView(o.id)} aria-label={o.id} style={{ width:40, height:40, borderRadius:999, border:0, cursor:'pointer', background: view===o.id ? 'var(--surface)' : 'transparent', boxShadow: view===o.id ? 'var(--shadow-pill)' : 'none', display:'flex', alignItems:'center', justifyContent:'center', color: view===o.id ? '#1a1f24' : '#5b6772' }}>{o.icon}</button>
          ))}
        </div>
      </div>
      <div style={{ marginTop:22, display:'grid', gridTemplateColumns: view==='grid' ? 'repeat(2,minmax(0,1fr))' : 'repeat(1,minmax(0,1fr))', gap:16 }}>
        {items.map(i => <CategoryCard key={i.id} item={i}/>)}
      </div>
    </section>
  );
}

// ─── ActivityPanel ────────────────────────────────────────────────────────────

const KIND_ICON: Record<string, React.ElementType> = { moms:Calendar, action:Mail, alert:Zap, tip:Sparkles };

function InsightCard({ a }: { a: Activity }) {
  const Icon = KIND_ICON[a.kind] || Sparkles;
  return (
    <div className="inv-ai-card" style={{ display:'flex', flexDirection:'column', gap:10, borderRadius:20, background:a.color, padding:16, position:'relative', boxShadow:'8px 8px 22px rgba(80,90,120,.14),-3px -3px 10px rgba(255,255,255,.55)' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, position:'relative' }}>
        <div style={{ width:36, height:36, borderRadius:11, flex:'none', background:'rgba(255,255,255,.85)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'inset 1px 1px 3px rgba(0,0,0,.06)' }}>
          <Icon size={18} strokeWidth={1.6} color={a.iconColor}/>
        </div>
        <span style={{ fontSize:10, fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', color:a.iconColor, padding:'3px 9px', borderRadius:999, background:'rgba(255,255,255,.7)' }}>{a.tag}</span>
        <button aria-label="open" onClick={() => toast(a.cta)} style={{ marginLeft:'auto', width:28, height:28, borderRadius:999, border:0, background:'rgba(255,255,255,.7)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
          <ArrowUpRight size={14} strokeWidth={1.7}/>
        </button>
      </div>
      <div>
        <div style={{ fontWeight:700, fontSize:15, letterSpacing:'-.01em', color:'var(--ink)', lineHeight:1.25 }}>{a.title}</div>
        <div style={{ fontSize:12, color:'var(--ink-2)', marginTop:6, lineHeight:1.45 }}>{a.sub}</div>
      </div>
      <div onClick={() => toast(a.cta)} style={{ display:'inline-flex', alignSelf:'flex-start', marginTop:4, padding:'7px 12px', borderRadius:999, background:'rgba(20,24,28,.86)', color:'#fff', fontSize:11, fontWeight:600, cursor:'pointer', border:0, fontFamily:'inherit' }}>{a.cta} →</div>
    </div>
  );
}

function ActivityPanel() {
  const [filter, setFilter] = useState<Filter>('all');
  const pills = [
    { id:'all' as Filter,    label:'All',         emoji:'✨' },
    { id:'alerts' as Filter, label:'Alerts',      emoji:'⚠️' },
    { id:'tips' as Filter,   label:'Suggestions', emoji:'💡' },
    { id:'done' as Filter,   label:'Done',        emoji:'✅' },
  ];
  const filtered = ACTIVITIES.filter(a => {
    if (filter==='all')    return true;
    if (filter==='alerts') return a.kind==='alert' || a.kind==='action';
    if (filter==='tips')   return a.kind==='tip'   || a.kind==='moms';
    return false;
  });
  return (
    <section className="inv-glass" style={{ width:380, flex:'none', padding:'24px 22px 26px', borderRadius:28, display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <h2 style={{ margin:0, fontSize:24, fontWeight:700, letterSpacing:'-.03em', display:'flex', alignItems:'center', gap:8, color:'var(--ink)' }}>
            <Sparkles size={22} strokeWidth={1.6} color="#5b3fa6"/> AI Intelligence
          </h2>
          <div style={{ fontSize:11, color:'var(--ink-3)', marginTop:3 }}>Powered by Dinero AI · live</div>
        </div>
        <button className="inv-btn" style={{ width:34, height:34, padding:0, justifyContent:'center' }} aria-label="more"><MoreHorizontal size={14} strokeWidth={1.7}/></button>
      </div>
      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
        {pills.map(p => (
          <button key={p.id} onClick={() => setFilter(p.id)} style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 12px', borderRadius:999, border:0, cursor:'pointer', background: filter===p.id ? 'rgba(255,255,255,.85)' : 'rgba(255,255,255,.4)', boxShadow: filter===p.id ? '2px 2px 6px rgba(0,0,0,.08),-2px -2px 6px rgba(255,255,255,.6)' : 'inset 1px 1px 3px rgba(0,0,0,.04)', color:'var(--ink)', fontSize:12, fontWeight:600, fontFamily:'inherit' }}>
            <span style={{ fontSize:13 }}>{p.emoji}</span>{p.label}
          </button>
        ))}
      </div>
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', paddingBottom:2 }}>
        <div>
          <div style={{ fontSize:11, color:'var(--ink-3)', letterSpacing:'.06em', textTransform:'uppercase' }}>Priority Insights</div>
          <div style={{ fontWeight:800, fontSize:32, letterSpacing:'-.03em', lineHeight:1, marginTop:4, color:'var(--ink)' }}>{filtered.length} <span style={{ fontSize:13, color:'var(--ink-3)', fontWeight:500 }}>active</span></div>
        </div>
        <span style={{ fontSize:11, color:'var(--ink-3)' }}>updated 2 min ago</span>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {filtered.length === 0
          ? <div style={{ padding:'30px 20px', textAlign:'center', color:'var(--ink-3)', fontSize:13, background:'rgba(255,255,255,.45)', borderRadius:18 }}>All caught up ✨</div>
          : filtered.map(a => <InsightCard key={a.id} a={a}/>)
        }
      </div>
    </section>
  );
}

// ─── TweaksPanel ──────────────────────────────────────────────────────────────

function TweaksPanel({ tweaks, set }: {
  tweaks: { palette:Palette; density:Density; showActivity:boolean; resultat:number };
  set: (k: string, v: unknown) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position:'fixed', bottom:24, right:24, zIndex:100, fontFamily:'var(--font-jakarta,inherit)' }}>
      <button className="inv-btn inv-btn-dark" onClick={() => setOpen(o => !o)} style={{ gap:8 }}>
        <SlidersHorizontal size={16} strokeWidth={1.7}/> Tweaks
        <ChevronDown size={14} strokeWidth={2} style={{ transform: open ? 'rotate(180deg)' : 'none', transition:'transform .2s' }}/>
      </button>
      {open && (
        <div style={{ ...neo, position:'absolute', bottom:54, right:0, width:280, padding:'20px 18px 16px', borderRadius:20, display:'flex', flexDirection:'column', gap:18 }}>
          {/* Palette */}
          <div>
            <div style={{ fontSize:11, fontWeight:600, color:'var(--ink-3)', letterSpacing:'.06em', textTransform:'uppercase', marginBottom:10 }}>Palette</div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {(['mint','sky','peach','butter','dusk'] as Palette[]).map(p => (
                <button key={p} onClick={() => set('palette',p)} className="inv-btn" style={{ padding:'8px 14px', fontSize:13, boxShadow: tweaks.palette===p ? 'var(--shadow-in)' : 'var(--shadow-pill)', fontWeight: tweaks.palette===p ? 700 : 500, textTransform:'capitalize' }}>{p}</button>
              ))}
            </div>
          </div>
          {/* Density */}
          <div>
            <div style={{ fontSize:11, fontWeight:600, color:'var(--ink-3)', letterSpacing:'.06em', textTransform:'uppercase', marginBottom:10 }}>Density</div>
            <div style={{ display:'flex', gap:6 }}>
              {(['comfortable','compact'] as Density[]).map(d => (
                <button key={d} onClick={() => set('density',d)} className="inv-btn" style={{ padding:'8px 14px', fontSize:13, flex:1, boxShadow: tweaks.density===d ? 'var(--shadow-in)' : 'var(--shadow-pill)', fontWeight: tweaks.density===d ? 700 : 500 }}>{d==='comfortable' ? 'Comfy' : 'Compact'}</button>
              ))}
            </div>
          </div>
          {/* Activity toggle */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span style={{ fontSize:13, color:'var(--ink-2)', fontWeight:500 }}>Activity column</span>
            <button onClick={() => set('showActivity',!tweaks.showActivity)} style={{ width:46, height:26, borderRadius:999, border:0, cursor:'pointer', background: tweaks.showActivity ? '#0c0e10' : '#d0d4d8', position:'relative', transition:'background .2s' }}>
              <div style={{ width:20, height:20, borderRadius:999, background:'#fff', position:'absolute', top:3, left: tweaks.showActivity ? 23 : 3, transition:'left .2s', boxShadow:'0 1px 3px rgba(0,0,0,.2)' }}/>
            </button>
          </div>
          {/* Resultat slider */}
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
              <span style={{ fontSize:11, fontWeight:600, color:'var(--ink-3)', letterSpacing:'.06em', textTransform:'uppercase' }}>Resultat (DKK)</span>
              <span className="inv-tabular" style={{ fontSize:12, color:'var(--ink-2)', fontWeight:600 }}>{dkk(tweaks.resultat)}</span>
            </div>
            <input type="range" min={-20000} max={20000} step={250} value={tweaks.resultat} onChange={e => set('resultat',Number(e.target.value))} style={{ width:'100%', accentColor:'#0c0e10' }}/>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function InvoiceDashboard() {
  const router = useRouter();
  const [palette, setPalette]           = useState<Palette>('mint');
  const [density, setDensity]           = useState<Density>('comfortable');
  const [showActivity, setShowActivity] = useState(true);
  const [resultat, setResultat]         = useState(-4502.25);
  const [syncing, setSyncing]           = useState(false);
  const [showTools, setShowTools]       = useState(false);
  const [showProfile, setShowProfile]   = useState(false);

  const set = useCallback((k: string, v: unknown) => {
    if (k==='palette')      setPalette(v as Palette);
    if (k==='density')      setDensity(v as Density);
    if (k==='showActivity') setShowActivity(v as boolean);
    if (k==='resultat')     setResultat(v as number);
  }, []);

  const onSync = () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 1800);
    toast('Syncing with Dinero.dk…');
  };

  return (
    <div className="inv-root" data-palette={palette} data-density={density}>
      <div style={{ maxWidth:1480, margin:'0 auto', padding:'26px 28px 100px' }}>
        <InvoiceHeader
          onSync={onSync}
          syncing={syncing}
          onAction={k => toast(k==='reports' ? 'Opening reports…' : 'Opening settings…')}
          onBack={() => router.back()}
          onSearch={() => { const el = document.getElementById('inv-search') as HTMLInputElement | null; el?.focus(); el?.scrollIntoView({ behavior:'smooth', block:'center' }); }}
          showTools={showTools}
          setShowTools={setShowTools}
          showProfile={showProfile}
          setShowProfile={setShowProfile}
        />
        <InvoiceSummary resultat={resultat} onAskAI={() => toast('AI Advisor: analyzing your books…')}/>
        <div style={{ display:'flex', gap:18, marginTop:20, alignItems:'flex-start' }}>
          <InvoiceLines/>
          {showActivity && <ActivityPanel/>}
        </div>
      </div>
      <TweaksPanel tweaks={{ palette, density, showActivity, resultat }} set={set}/>
    </div>
  );
}
