import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Wrench } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../auth/AuthProvider'
import { useUnits } from '../properties/useUnits'
import { Badge, Empty, PageHeader } from '../../components/ui'
const tone: any = { alta: 'red', media: 'amber', baja: 'green' }
export default function MaintenancePage() {
  const { orgId } = useAuth(); const qc = useQueryClient(); const units = useUnits(); const [open, setOpen] = useState(false)
  const [f, setF] = useState({ unit_id: '', description: '', priority: 'media', cost: '0' })
  const q = useQuery({ queryKey: ['maint'], queryFn: async () => { const { data, error } = await supabase.from('maintenance_requests').select('*, units(name, buildings(name))').order('created_at', { ascending: false }); if (error) throw error; return data as any[] } })
  const done = () => { qc.invalidateQueries({ queryKey: ['maint'] }); qc.invalidateQueries({ queryKey: ['mt-open'] }) }
  const add = useMutation({ mutationFn: async () => { const { error } = await supabase.from('maintenance_requests').insert({ org_id: orgId, unit_id: f.unit_id, description: f.description, priority: f.priority, cost: Number(f.cost) }); if (error) throw error }, onSuccess: () => { done(); setOpen(false); setF({ ...f, description: '' }) } })
  const upd = useMutation({ mutationFn: async (v: { id: string; status: string }) => { const { error } = await supabase.from('maintenance_requests').update({ status: v.status }).eq('id', v.id); if (error) throw error }, onSuccess: done })
  return (<div><PageHeader title="Mantenimiento" sub={`${q.data?.filter(x => x.status !== 'resuelta').length ?? 0} casos abiertos`} action={<button className="btn flex items-center gap-1" onClick={() => setOpen(!open)}><Plus size={18} />Incidencia</button>} />
    {open && <div className="card mb-4 grid gap-3 sm:grid-cols-2"><select className="inp" value={f.unit_id} onChange={e => setF({ ...f, unit_id: e.target.value })}><option value="">Unidad…</option>{units.data?.map(u => <option key={u.id} value={u.id}>{u.name} · {u.buildings?.name ?? ''}</option>)}</select>
      <select className="inp" value={f.priority} onChange={e => setF({ ...f, priority: e.target.value })}>{['baja', 'media', 'alta'].map(p => <option key={p}>{p}</option>)}</select>
      <textarea className="inp py-2 sm:col-span-2" rows={3} placeholder="Describe el problema" value={f.description} onChange={e => setF({ ...f, description: e.target.value })} />
      <input className="inp" type="number" placeholder="Costo estimado" value={f.cost} onChange={e => setF({ ...f, cost: e.target.value })} />
      <button className="btn" disabled={!f.unit_id || f.description.length < 3 || add.isPending} onClick={() => add.mutate()}>Guardar</button>{add.error && <p className="text-sm text-red-600 sm:col-span-2">{(add.error as Error).message}</p>}</div>}
    {!q.data?.length ? <Empty text="Sin incidencias. Todo en orden." /> : <div className="space-y-3">{q.data.map(t => <div key={t.id} className="card flex items-start gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand"><Wrench size={18} /></div>
      <div className="min-w-0 flex-1"><b>{t.description}</b><p className="text-sm text-slate-500">Unidad {t.units?.name} · {t.units?.buildings?.name ?? ''} · ${Number(t.cost).toLocaleString()}</p><div className="mt-2 flex items-center gap-2"><Badge tone={tone[t.priority]}>{t.priority}</Badge>
        <select className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm" value={t.status} onChange={e => upd.mutate({ id: t.id, status: e.target.value })}>{['abierta', 'en proceso', 'resuelta'].map(s => <option key={s}>{s}</option>)}</select></div></div></div>)}</div>}</div>)
}
