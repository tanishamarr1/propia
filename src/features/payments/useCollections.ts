import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useUnits } from '../properties/useUnits'
export type Row = { id: string; unit: string; building: string; tenant: string; phone: string; rent: number; paid: number; due: number; state: 'pagado' | 'parcial' | 'pendiente' | 'mora' }
export function useCollections() {
  const units = useUnits(); const month = new Date().toISOString().slice(0, 7)
  const q = useQuery({ queryKey: ['collections', month], queryFn: async () => { const [p, c] = await Promise.all([supabase.from('payments').select('unit_id, amount').eq('period', month), supabase.from('rental_contracts').select('unit_id, pay_day')]); if (p.error) throw p.error; return { p: p.data ?? [], c: c.data ?? [] } } })
  const today = new Date().getDate()
  const rows: Row[] = (units.data ?? []).filter(u => u.status === 'alquilada').map(u => {
    const paid = (q.data?.p ?? []).filter(x => x.unit_id === u.id).reduce((a, x) => a + Number(x.amount), 0); const payDay = q.data?.c.find(x => x.unit_id === u.id)?.pay_day ?? 5; const rent = Number(u.rent)
    const state = paid >= rent ? 'pagado' : today > payDay ? 'mora' : paid > 0 ? 'parcial' : 'pendiente'
    return { id: u.id, unit: u.name, building: u.buildings?.name ?? '', tenant: u.tenants?.full_name ?? 'Sin inquilino', phone: u.tenants?.phone ?? '', rent, paid, due: Math.max(0, rent - paid), state } })
  const expected = rows.reduce((a, r) => a + r.rent, 0); const got = rows.reduce((a, r) => a + Math.min(r.paid, r.rent), 0)
  return { rows, expected, got, late: rows.filter(r => r.state === 'mora').reduce((a, r) => a + r.due, 0), pct: expected ? Math.round(100 * got / expected) : 0, isLoading: units.isLoading || q.isLoading, month }
}
export const wa = (r: Row) => `https://wa.me/${r.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${r.tenant}, le recordamos el pago pendiente de $${r.due.toLocaleString()} de la unidad ${r.unit}. ¡Gracias!`)}`
