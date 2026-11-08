import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../auth/AuthProvider'
import { useUnits } from '../properties/useUnits'
import { Badge, Empty, PageHeader } from '../../components/ui'
export default function ContractsPage() {
  const { orgId } = useAuth(); const qc = useQueryClient(); const units = useUnits(); const [open, setOpen] = useState(false)
  const [f, setF] = useState({ unit_id: '', tenant_id: '', start_date: '', end_date: '', monthly_amount: '', deposit: '0', pay_day: '1' })
  const tn = useQuery({ queryKey: ['tenants-min'], queryFn: async () => (await supabase.from('tenants').select('id, full_name').order('full_name')).data ?? [] })
  const c = useQuery({ queryKey: ['contracts'], queryFn: async () => { const { data, error } = await supabase.from('rental_contracts').select('*, units(name, buildings(name)), tenants(full_name)').order('end_date'); if (error) throw error; return data as any[] } })
  const add = useMutation({ mutationFn: async () => {
    const { error } = await supabase.from('rental_contracts').insert({ org_id: orgId, unit_id: f.unit_id, tenant_id: f.tenant_id, start_date: f.start_date, end_date: f.end_date, monthly_amount: Number(f.monthly_amount), deposit: Number(f.deposit), pay_day: Number(f.pay_day) }); if (error) throw error
    await supabase.from('units').update({ tenant_id: f.tenant_id, status: 'alquilada', rent: Number(f.monthly_amount) }).eq('id', f.unit_id) },
    onSuccess: () => { ['contracts', 'units'].forEach(k => qc.invalidateQueries({ queryKey: [k] })); setOpen(false) } })
  const days = (d: string) => Math.ceil((new Date(d).getTime() - Date.now()) / 864e5)
  const ok = f.unit_id && f.tenant_id && f.start_date && f.end_date && Number(f.monthly_amount) > 0 && f.end_date > f.start_date
  const I = (k: keyof typeof f, p: string, type = 'text') => <input className="inp" type={type} placeholder={p} aria-label={p} value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })} />
  return (<div><PageHeader title="Contratos" sub={`${c.data?.length ?? 0} contratos`} action={<button className="btn flex items-center gap-1" onClick={() => setOpen(!open)}><Plus size={18} />Nuevo</button>} />
    {open && <div className="card mb-4 grid gap-3 sm:grid-cols-2"><select className="inp" value={f.unit_id} onChange={e => setF({ ...f, unit_id: e.target.value })}><option value="">Unidad…</option>{units.data?.map(u => <option key={u.id} value={u.id}>{u.name} · {u.buildings?.name ?? ''}</option>)}</select>
      <select className="inp" value={f.tenant_id} onChange={e => setF({ ...f, tenant_id: e.target.value })}><option value="">Inquilino…</option>{tn.data?.map((x: any) => <option key={x.id} value={x.id}>{x.full_name}</option>)}</select>
      <label className="text-sm text-slate-500">Inicio{I('start_date', 'Inicio', 'date')}</label><label className="text-sm text-slate-500">Fin{I('end_date', 'Fin', 'date')}</label>
      {I('monthly_amount', 'Monto mensual', 'number')}{I('deposit', 'Depósito', 'number')}{I('pay_day', 'Día de pago (1-31)', 'number')}
      <button className="btn" disabled={!ok || add.isPending} onClick={() => add.mutate()}>Crear contrato</button>{add.error && <p className="text-sm text-red-600 sm:col-span-2">{(add.error as Error).message}</p>}</div>}
    {!c.data?.length ? <Empty text="Aún no hay contratos. Crea el primero." /> : <div className="space-y-3">{c.data.map(x => { const d = days(x.end_date); return <div key={x.id} className="card"><div className="flex items-start justify-between gap-2"><div><b>{x.tenants?.full_name}</b><p className="text-sm text-slate-500">Unidad {x.units?.name} · {x.units?.buildings?.name ?? ''}</p></div>
      {d < 0 ? <Badge tone="red">Vencido</Badge> : d <= 30 ? <Badge tone="amber">Vence en {d} días</Badge> : <Badge tone="green">Vigente</Badge>}</div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-sm"><div><p className="text-xs text-slate-500">Mensual</p><b>${Number(x.monthly_amount).toLocaleString()}</b></div><div><p className="text-xs text-slate-500">Depósito</p><b>${Number(x.deposit).toLocaleString()}</b></div><div><p className="text-xs text-slate-500">Día de pago</p><b>{x.pay_day}</b></div></div>
      <p className="mt-2 text-xs text-slate-500">{x.start_date} → {x.end_date}</p></div> })}</div>}</div>)
}
