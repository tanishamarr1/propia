import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { LayoutDashboard, Building2, Wallet, Users, FileText, Wrench, Tag, BarChart3, FolderOpen, Ellipsis, X, LogOut } from 'lucide-react'
import Logo from './Logo'
import { supabase } from '../lib/supabase'
import { useAuth } from '../features/auth/AuthProvider'
const main = [{ to: '/', label: 'Inicio', Icon: LayoutDashboard }, { to: '/propiedades', label: 'Propiedades', Icon: Building2 }, { to: '/cobros', label: 'Cobros', Icon: Wallet }, { to: '/contratos', label: 'Contratos', Icon: FileText }]
const more = [{ to: '/inquilinos', label: 'Inquilinos', Icon: Users }, { to: '/mantenimiento', label: 'Mantenimiento', Icon: Wrench }, { to: '/ventas', label: 'Ventas', Icon: Tag }, { to: '/reportes', label: 'Reportes', Icon: BarChart3 }, { to: '/documentos', label: 'Documentos', Icon: FolderOpen }]
type N = typeof main[0]
export default function Layout() {
  const { orgName } = useAuth(); const [sheet, setSheet] = useState(false); const loc = useLocation(); const inMore = more.some(m => loc.pathname.startsWith(m.to))
  const del = async () => { if (!confirm('Se eliminará tu cuenta y tus accesos de forma permanente. ¿Continuar?')) return; const { error } = await supabase.rpc('delete_my_account'); if (error) alert(error.message); else supabase.auth.signOut() }
  const side = (n: N) => <NavLink key={n.to} to={n.to} end={n.to === '/'} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2 text-[15px] transition ${isActive ? 'bg-black/[.06] font-semibold text-ink' : 'text-slate-600 hover:bg-black/[.03]'}`}>{({ isActive }) => <><n.Icon size={18} strokeWidth={1.9} className={isActive ? 'text-brand' : 'text-slate-400'} />{n.label}</>}</NavLink>
  const row = (n: N) => <NavLink key={n.to} to={n.to} onClick={() => setSheet(false)} className={({ isActive }) => `flex items-center gap-3 px-4 py-3.5 text-[16px] ${isActive ? 'font-semibold text-brand' : ''}`}><n.Icon size={20} strokeWidth={1.8} className="text-slate-400" />{n.label}</NavLink>
  const H = (t: string) => <p className="mb-1 mt-6 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{t}</p>
  return (<div className="min-h-screen md:flex">
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-black/5 px-3 py-5 md:flex"><div className="mb-3 flex items-center gap-2.5 px-3"><Logo size={30} /><span className="text-[17px] font-bold tracking-tight">PropiaApp</span></div>
      {H('Principal')}{main.map(side)}{H('Gestión')}{more.map(side)}
      <div className="mt-auto border-t border-black/5 pt-3"><div className="flex items-center gap-3 px-3 py-2"><div className="grid h-8 w-8 place-items-center rounded-full bg-brand text-[13px] font-semibold text-white">{(orgName || 'P')[0].toUpperCase()}</div><div className="min-w-0"><p className="truncate text-[14px] font-semibold">{orgName}</p><p className="text-xs text-slate-400">Administrador</p></div></div>
        <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[14px] text-slate-500 hover:bg-black/[.03]" onClick={() => supabase.auth.signOut()}><LogOut size={16} />Cerrar sesión</button><button className="px-3 py-1 text-xs text-slate-400" onClick={del}>Eliminar mi cuenta</button></div></aside>
    <div className="min-w-0 flex-1"><header className="sticky top-0 z-20 flex items-center gap-2.5 border-b border-black/5 bg-white/75 px-4 pb-2.5 pt-[max(.625rem,env(safe-area-inset-top))] backdrop-blur-xl md:hidden"><Logo size={28} /><div className="min-w-0"><p className="text-[15px] font-bold leading-none">PropiaApp</p><p className="truncate text-xs text-slate-500">{orgName}</p></div></header>
      <main className="mx-auto w-full max-w-6xl p-4 pb-32 sm:p-6 md:p-10"><Outlet /></main></div>
    {sheet && <div className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm md:hidden" onClick={() => setSheet(false)}><div className="absolute inset-x-0 bottom-0 rounded-t-[28px] bg-[#f5f5f7] p-4 pb-28" onClick={e => e.stopPropagation()}><div className="mx-auto mb-3 h-1 w-9 rounded-full bg-black/15" /><div className="mb-3 flex items-center justify-between px-1"><b className="text-[17px]">Más</b><button aria-label="Cerrar" className="grid h-8 w-8 place-items-center rounded-full bg-black/5" onClick={() => setSheet(false)}><X size={16} /></button></div>
      <div className="list overflow-hidden rounded-2xl bg-white">{more.map(row)}</div><div className="list mt-4 overflow-hidden rounded-2xl bg-white"><button className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-[16px]" onClick={() => supabase.auth.signOut()}><LogOut size={20} className="text-slate-400" />Cerrar sesión</button><button className="w-full px-4 py-3.5 text-left text-[16px] text-[#d70015]" onClick={del}>Eliminar mi cuenta</button></div></div></div>}
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-black/10 bg-white/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
      {main.map(({ to, label, Icon }) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `flex flex-1 flex-col items-center gap-0.5 pb-1.5 pt-2 text-[10px] font-medium ${isActive ? 'text-brand' : 'text-slate-400'}`}><Icon size={24} strokeWidth={1.8} />{label}</NavLink>)}
      <button onClick={() => setSheet(true)} className={`flex flex-1 flex-col items-center gap-0.5 pb-1.5 pt-2 text-[10px] font-medium ${inMore ? 'text-brand' : 'text-slate-400'}`}><Ellipsis size={24} strokeWidth={1.8} />Más</button></nav></div>)
}
