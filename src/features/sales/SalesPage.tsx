import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../auth/AuthProvider'
import { useUnits } from '../properties/useUnits'
import { Badge, Empty, PageHeader } from '../../components/ui'
const ST = ['interesado', 'oferta', 'reservada', 'vendida', 'cancelada']; const tone: any = { interesado: 'slate', oferta: 'blue', reservada: 'amber', vendida: 'green', cancelada: 'red' }
export default function SalesPage() {
  const { orgId } = useAuth(); const qc = useQueryClient(); const units = useUnits(); const [open, setOpen] = useState(false)
  const [f, setF] = useState({ unit_id: '', buyer_name: '', buyer_phone: '', price: '', offer: '', commission_pct: '3' })
  const s = useQuery({ queryKey: ['sales'], queryFn: async () => { const { data, error } = await supabase.from('sales').select('*, units(name, buildings(name))').order('created_at', { ascending: false }); if (error) throw error; return data as any[] } })
  const refresh = () => ['sales', 'units'].forEach(k => qc.invalidateQueries({ queryKey: [k] }))
  const add = useMutation({ mutationFn: async () => { const { error } = await supabase.from('sales').insert({ org_id: orgId, unit_id: f.unit_id, buyer_name: f.buyer_name, buyer_phone: f.buyer_phone, price: Number(f.price), offer: f.offer ? Number(f.offer) : null, commission_pct: Number(f.commission_pct) }); if (error) throw error }, onSuccess: () => { refresh(); setOpen(false) } })
  const upd = useMutation({ mutationFn: async (v: { id: string; unit_id: string; status: string }) => {
    const { error } = await supabase.from('sales').update({ status: v.status }).eq('id', v.id); if (error) throw error
    if (v.status === 'vendida' || v.status === 'reservada') await supabase.from('units').update({ status: v.status }).eq('id', v.unit_id) }, onSuccess: refresh })
  const sold = (s.data ?? []).filter(x => x.status === 'vendida'); const total = sold.reduce((a, x) => a + Number(x.offer ?? x.price), 0); const comm = sold.reduce((a, x) => a + Number(x.offer ?? x.price) * Number(x.commission_pct) / 100, 0)
  const I = (k: keyof typeof f, p: string, t = 'text') => <input className="inp" type={t} placeholder={p} aria-label={p} value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })} />
  return (<div><PageHeader title="Ventas" sub={`Vendido $${total.toLocaleString()} · Comisiones $${comm.toLocaleString()}`} action={<button className="btn flex items-center gap-1" onClick={() => setOpen(!open)}><Plus size={18} />Operación</button>} />
    {open && <div className="card mb-4 grid gap-3 sm:grid-cols-2"><select className="inp sm:col-span-2" value={f.unit_id} onChange={e => { const u = units.data?.find(x => x.id === e.target.value); setF({ ...f, unit_id: e.target.value }) }}><option value="">Propiedad…</option>{units.data?.map(u => <option key={u.id} value={u.id}>{u.type} {u.name} · {u.buildings?.name ?? ''}</option>)}</select>
      {I('buyer_name', 'Cliente interesado')}{I('buyer_phone', 'Teléfono')}{I('price', 'Precio de lista', 'number')}{I('offer', 'Oferta recibida', 'number')}{I('commission_pct', 'Comisión %', 'number')}
      <button className="btn" disabled={!f.unit_id || f.buyer_name.length < 2 || !(Number(f.price) > 0) || add.isPending} onClick={() => add.mutate()}>Guardar</button>{add.error && <p className="text-sm text-red-600 sm:col-span-2">{(add.error as Error).message}</p>}</div>}
    {!s.data?.length ? <Empty text="Sin operaciones de venta todavía." /> : <div className="space-y-3">{s.data.map(x => <div key={x.id} className="card"><div className="flex justify-between gap-2"><div><b>{x.buyer_name}</b><p className="text-sm text-slate-500">{x.units?.name} · {x.units?.buildings?.name ?? ''}</p></div><Badge tone={tone[x.status]}>{x.status}</Badge></div>
      <div className="mt-3 flex items-end justify-between"><div className="text-sm"><p className="text-xs text-slate-500">Lista / Oferta</p><b>${Number(x.price).toLocaleString()}</b>{x.offer && <span className="text-slate-500"> / ${Number(x.offer).toLocaleString()}</span>}<p className="text-xs text-slate-500">Comisión {x.commission_pct}% = ${(Number(x.offer ?? x.price) * x.commission_pct / 100).toLocaleString()}</p></div>
        <select className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm" value={x.status} onChange={e => upd.mutate({ id: x.id, unit_id: x.unit_id, status: e.target.value })}>{ST.map(o => <option key={o}>{o}</option>)}</select></div></div>)}</div>}</div>)
}
