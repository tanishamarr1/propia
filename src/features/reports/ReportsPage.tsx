import { useQuery } from '@tanstack/react-query'
import { Download } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useUnits } from '../properties/useUnits'
import { PageHeader } from '../../components/ui'
export default function ReportsPage() {
  const units = useUnits()
  const r = useQuery({ queryKey: ['report'], queryFn: async () => {
    const [p, m] = await Promise.all([supabase.from('payments').select('amount, period'), supabase.from('maintenance_requests').select('cost, created_at')])
    if (p.error) throw p.error; if (m.error) throw m.error
    const months = Array.from({ length: 6 }, (_, i) => { const d = new Date(); d.setMonth(d.getMonth() - 5 + i); return d.toISOString().slice(0, 7) })
    return months.map(k => { const inc = (p.data ?? []).filter(x => x.period === k).reduce((a, x) => a + Number(x.amount), 0); const exp = (m.data ?? []).filter(x => x.created_at.slice(0, 7) === k).reduce((a, x) => a + Number(x.cost ?? 0), 0); return { k, inc, exp, net: inc - exp } }) } })
  const d = r.data ?? []; const mx = Math.max(1, ...d.map(x => x.inc)); const cur = d[d.length - 1]
  const by: Record<string, { t: number; r: number }> = {}; (units.data ?? []).forEach(u => { const n = u.buildings?.name ?? 'Independientes'; by[n] ??= { t: 0, r: 0 }; by[n].t++; if (u.status === 'alquilada') by[n].r++ })
  const csv = () => { const t = 'mes,ingresos,gastos,neto\n' + d.map(x => [x.k, x.inc, x.exp, x.net].join(',')).join('\n'); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([t], { type: 'text/csv' })); a.download = 'reporte-propiaapp.csv'; a.click() }
  return (<div><PageHeader title="Reportes" sub="Últimos 6 meses" action={<button className="btn flex items-center gap-1" onClick={csv}><Download size={18} />CSV</button>} />
    <div className="mb-4 grid grid-cols-3 gap-3">{[['Ingresos', cur?.inc], ['Gastos', cur?.exp], ['Neto', cur?.net]].map(([k, v]) => <div key={k as string} className="card"><p className="text-xs uppercase text-slate-500">{k}</p><p className="text-xl font-bold text-ink">${Number(v ?? 0).toLocaleString()}</p></div>)}</div>
    <div className="card mb-4"><p className="mb-2 font-semibold">Ingresos por mes</p><svg viewBox="0 0 300 130" width="100%" role="img" aria-label="Ingresos por mes">{d.map((x, i) => { const h = Math.round(85 * x.inc / mx); return <g key={x.k}><rect x={i * 50 + 10} y={100 - h} width="30" height={h} rx="5" fill="#0b6b5a" opacity={i === 5 ? 1 : .5} /><text x={i * 50 + 25} y="118" fontSize="10" textAnchor="middle" fill="#64748b">{x.k.slice(5)}</text></g> })}</svg></div>
    <div className="card"><p className="mb-3 font-semibold">Ocupación por edificio</p>{Object.entries(by).map(([n, v]) => <div key={n} className="mb-3"><div className="flex justify-between text-sm"><span>{n}</span><span>{v.r}/{v.t}</span></div><div className="h-2 rounded bg-brand-soft"><div className="h-2 rounded bg-brand" style={{ width: Math.round(100 * v.r / v.t) + '%' }} /></div></div>)}{!Object.keys(by).length && <p className="text-slate-500">Sin datos todavía.</p>}</div></div>)
}
