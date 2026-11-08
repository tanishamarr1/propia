import { supabase } from '../../lib/supabase'
const U = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=70`
const P = { tower: U('photo-1545324418-cc1a3fa10c00'), apt: U('photo-1522708323590-d24dbb6b0267'), living: U('photo-1560448204-e02f11c3d0e2'), house: U('photo-1564013799919-ab600027ffc6'), villa: U('photo-1512917774080-9991f1c4c750'), office: U('photo-1486406146926-c627a92ad1ab'), loft: U('photo-1502672260266-1c1ef2d93688') }
const day = (o: number) => new Date(Date.now() + o * 864e5).toISOString().slice(0, 10)
const mon = (o: number) => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() + o); return d }
let made: [string, string[]][] = []
async function ins(t: string, rows: any[]) { const { data, error } = await supabase.from(t).insert(rows).select(); if (error) throw new Error(`${t}: ${error.message}`); made.push([t, (data ?? []).map((r: any) => r.id)]); return data as any[] }
async function run(org: string) {
  const B = await ins('buildings', [
    { org_id: org, name: 'Torre Altamira', address: 'Av. Winston Churchill 1420, Piantini, Santo Domingo' },
    { org_id: org, name: 'Plaza Central', address: 'Av. Abraham Lincoln 902, Naco, Santo Domingo' },
    { org_id: org, name: 'Residencial Los Robles', address: 'Calle Los Álamos 45, Arroyo Hondo' },
    { org_id: org, name: 'Torre Marina', address: 'Malecón Center 88, Gazcue, Santo Domingo' }])
  const names = ['Roberto Méndez', 'Carlos Gómez', 'Sofía Morales', 'Andrea Silva', 'Café & Bistro SRL', 'Miguel Ángel Cruz', 'Laura Benítez', 'Familia Pérez', 'Daniela Reyes', 'Juan Pablo Santana', 'Carolina Fernández', 'Luis Alberto Peña', 'Valentina Rosario', 'Clínica Dental Sonrisa', 'Ricardo Almonte', 'Patricia Jiménez', 'Estudio Arquitectos RD', 'Mariela Castillo']
  const T = await ins('tenants', names.map((n, i) => ({ org_id: org, full_name: n, phone: `809-555-${String(1000 + i * 37).slice(0, 4)}`, email: n.includes(' ') && !/SRL|Clínica|Estudio|Familia/.test(n) ? n.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '.') + '@correo.com' : null })))
  // [edificio, nombre, tipo, hab, baños, m2, renta, estado, inquilino, foto]
  const spec: any[] = [
    [0, '3A', 'Apartamento', 2, 2, 84, 950, 'alquilada', 0, P.apt], [0, '3B', 'Apartamento', 1, 1, 56, 780, 'disponible', null, P.living], [0, '4A', 'Apartamento', 2, 2, 88, 1000, 'alquilada', 2, P.loft], [0, '4B', 'Apartamento', 3, 2, 110, 1200, 'alquilada', 1, P.apt],
    [0, '5A', 'Apartamento', 2, 2, 90, 1050, 'alquilada', 3, P.living], [0, '5B', 'Apartamento', 3, 2, 112, 1250, 'reservada', null, P.loft], [0, '6A', 'Apartamento', 2, 2, 92, 1100, 'alquilada', 8, P.apt], [0, '6B', 'Apartamento', 3, 3, 125, 1400, 'mantenimiento', null, P.living],
    [1, '101', 'Local comercial', 0, 1, 70, 1500, 'alquilada', 4, P.office], [1, '102', 'Local comercial', 0, 1, 95, 1800, 'alquilada', 5, P.tower], [1, '103', 'Oficina', 0, 1, 45, 900, 'disponible', null, P.office], [1, '201', 'Oficina', 0, 2, 120, 1650, 'alquilada', 16, P.office], [1, '202', 'Local comercial', 0, 1, 60, 1300, 'alquilada', 13, P.tower],
    [2, '1', 'Casa', 3, 2, 250, 2200, 'alquilada', 7, P.house], [2, '2', 'Casa', 3, 2, 240, 2100, 'alquilada', 6, P.villa], [2, '3', 'Casa', 4, 3, 280, 2500, 'disponible', null, P.villa], [2, '4', 'Casa', 4, 3, 300, 2700, 'vendida', null, P.house],
    [3, 'PH1', 'Apartamento', 4, 4, 240, 3800, 'alquilada', 14, P.tower], [3, '12A', 'Apartamento', 2, 2, 95, 1350, 'alquilada', 9, P.apt], [3, '12B', 'Apartamento', 2, 2, 98, 1400, 'alquilada', 10, P.loft], [3, '14A', 'Apartamento', 3, 2, 130, 1700, 'alquilada', 11, P.living], [3, '14B', 'Apartamento', 3, 3, 135, 1750, 'disponible', null, P.apt]]
  const Uo = await ins('units', spec.map(s => ({ org_id: org, building_id: B[s[0]].id, name: s[1], type: s[2], bedrooms: s[3], bathrooms: s[4], area_m2: s[5], rent: s[6], status: s[7], tenant_id: s[8] != null ? T[s[8]].id : null, photo_path: s[9] })))
  const rented = Uo.filter(u => u.status === 'alquilada')
  await ins('rental_contracts', rented.map((u, i) => ({ org_id: org, unit_id: u.id, tenant_id: u.tenant_id, start_date: day(-300 + i * 9), end_date: i % 6 === 0 ? day(10 + i) : day(120 + i * 25), monthly_amount: u.rent, deposit: u.rent * 2, pay_day: [1, 5, 10, 15][i % 4] })))
  const pays: any[] = []; const meth = ['Transferencia', 'Zelle', 'Efectivo', 'Tarjeta']
  rented.forEach((u, i) => { for (let k = 5; k >= 1; k--) { const d = mon(-k); d.setDate(3 + (i % 5)); pays.push({ org_id: org, unit_id: u.id, tenant_id: u.tenant_id, amount: u.rent, method: meth[(i + k) % 4], period: d.toISOString().slice(0, 7), paid_at: d.toISOString() }) }
    if (i % 5 !== 0) { const d = new Date(); d.setDate(Math.max(1, d.getDate() - (i % 6))); pays.push({ org_id: org, unit_id: u.id, tenant_id: u.tenant_id, amount: i % 5 === 1 ? Math.round(u.rent / 2) : u.rent, method: meth[i % 4], period: d.toISOString().slice(0, 7), paid_at: d.toISOString() }) } })
  await ins('payments', pays)
  const un = (n: string, b: number) => Uo.find(u => u.name === n && u.building_id === B[b].id).id
  await ins('maintenance_requests', [
    { org_id: org, unit_id: un('102', 1), description: 'Filtración en tubería principal', priority: 'alta', status: 'en proceso', cost: 180 }, { org_id: org, unit_id: un('4B', 0), description: 'Fallo en cuadro eléctrico y disyuntor', priority: 'alta', status: 'abierta', cost: 210 },
    { org_id: org, unit_id: un('6B', 0), description: 'Reparación de piso cerámico', priority: 'media', status: 'en proceso', cost: 450 }, { org_id: org, unit_id: un('PH1', 3), description: 'Revisión semestral de ascensores', priority: 'media', status: 'abierta', cost: 600 },
    { org_id: org, unit_id: un('5A', 0), description: 'Cambio de cerradura', priority: 'baja', status: 'resuelta', cost: 60 }, { org_id: org, unit_id: un('2', 2), description: 'Pintura de fachada', priority: 'baja', status: 'resuelta', cost: 380 }])
  await ins('sales', [
    { org_id: org, unit_id: un('4', 2), buyer_name: 'Fernando Ruiz', buyer_phone: '809-555-2201', price: 240000, offer: 240000, commission_pct: 3, status: 'vendida' }, { org_id: org, unit_id: un('5B', 0), buyer_name: 'Gabriela Núñez', buyer_phone: '829-555-2202', price: 185000, offer: 176000, commission_pct: 3, status: 'reservada' },
    { org_id: org, unit_id: un('3', 2), buyer_name: 'Inversiones Altamira', buyer_phone: '849-555-2203', price: 320000, offer: 305000, commission_pct: 2.5, status: 'oferta' }, { org_id: org, unit_id: un('14B', 3), buyer_name: 'Héctor Domínguez', buyer_phone: '809-555-2204', price: 210000, commission_pct: 3, status: 'interesado' }])
}

export async function seedDemo(org: string) { made = []; const { count } = await supabase.from('units').select('id', { count: 'exact', head: true }); if (count) throw new Error('Ya hay propiedades cargadas en tu espacio.'); try { await run(org) } catch (e) { for (const [t, ids] of [...made].reverse()) if (ids.length) await supabase.from(t).delete().in('id', ids); throw e } }
