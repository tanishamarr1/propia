import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, MessageCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../auth/AuthProvider'
import { useUnits } from '../properties/useUnits'
import { Badge, Empty, PageHeader } from '../../components/ui'
export default function TenantsPage() {
  const { orgId } = useAuth(); const qc = useQueryClient(); const units = useUnits(); const [open, setOpen] = useState(false); const [q, setQ] = useState('')
  const [f, setF] = useState({ full_name: '', phone: '', email: '', unit_id: '' })
  const t = useQuery({ queryKey: ['tenants'], queryFn: async () => { const { data, error } = await supabase.from('tenants').select('*, units(name)').order('full_name'); if (error) throw error; return data as any[] } })
  const add = useMutation({ mutationFn: async () => {
    const { data, error } = await supabase.from('tenants').insert({ org_id: orgId, full_name: f.full_name, phone: f.phone, email: f.email }).select('id').single(); if (error) throw error
    if (f.unit_id) { const r = await supabase.from('units').update({ tenant_id: data.id, status: 'alquilada' }).eq('id', f.unit_id); if (r.error) throw r.error } },
    onSuccess: () => { ['tenants', 'units'].forEach(k => qc.invalidateQueries({ queryKey: [k] })); setOpen(false); setF({ full_name: '', phone: '', email: '', unit_id: '' }) } })
  const free = units.data?.filter(u => !u.tenant_id) ?? []
  const list = (t.data ?? []).filter(x => x.full_name.toLowerCase().includes(q.toLowerCase()))
  return (<div><PageHeader title="Inquilinos" sub={`${t.data?.length ?? 0} registrados`} action={<button className="btn flex items-center gap-1" onClick={() => setOpen(!open)}><Plus size={18} />Nuevo</button>} />
    {open && <div className="card mb-4 grid gap-3 sm:grid-cols-2"><input className="inp" placeholder="Nombre completo" value={f.full_name} onChange={e => setF({ ...f, full_name: e.target.value })} /><input className="inp" placeholder="Teléfono" inputMode="tel" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} />
      <input className="inp" type="email" placeholder="Correo" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} /><select className="inp" value={f.unit_id} onChange={e => setF({ ...f, unit_id: e.target.value })}><option value="">Asignar unidad (opcional)</option>{free.map(u => <option key={u.id} value={u.id}>{u.name} · {u.buildings?.name ?? ''}</option>)}</select>
      <button className="btn sm:col-span-2" disabled={f.full_name.length < 2 || add.isPending} onClick={() => add.mutate()}>Guardar inquilino</button>{add.error && <p className="text-sm text-red-600 sm:col-span-2">{(add.error as Error).message}</p>}</div>}
    <input className="inp mb-4" placeholder="Buscar inquilino…" value={q} onChange={e => setQ(e.target.value)} />
    {!list.length ? <Empty text="Aún no tienes inquilinos registrados." /> : <div className="space-y-3">{list.map(x => <div key={x.id} className="card flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-full bg-ink font-semibold text-white">{x.full_name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()}</div>
      <div className="min-w-0 flex-1"><b className="block truncate">{x.full_name}</b><p className="truncate text-sm text-slate-500">{x.phone || 'Sin teléfono'}{x.email ? ' · ' + x.email : ''}</p></div>
      <div className="text-right">{x.units?.length ? <Badge tone="green">Unidad {x.units[0].name}</Badge> : <Badge>Sin unidad</Badge>}{x.phone && <a className="mt-1 flex justify-end text-brand" aria-label="WhatsApp" target="_blank" rel="noreferrer" href={`https://wa.me/${x.phone.replace(/\D/g, '')}`}><MessageCircle size={18} /></a>}</div></div>)}</div>}</div>)
}
