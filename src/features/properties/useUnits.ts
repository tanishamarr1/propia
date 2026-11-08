import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../auth/AuthProvider'
export type Unit = { id: string; name: string; type: string; bedrooms: number; bathrooms: number; area_m2: number | null; rent: number; status: string; tenant_id: string | null; photo_path: string | null; buildings: { name: string } | null; tenants: { full_name: string; phone: string | null } | null }
export const useUnits = () => useQuery({ queryKey: ['units'], queryFn: async () => {
  const { data, error } = await supabase.from('units').select('*, buildings(name), tenants(full_name, phone)').order('created_at', { ascending: false }); if (error) throw error; return data as unknown as Unit[] } })
export function usePhotoUrls(paths: string[]) { const k = paths.filter(p => p && !p.startsWith('http')).sort()
  const q = useQuery({ queryKey: ['photos', k.join('|')], enabled: k.length > 0, staleTime: 3e5, queryFn: async () => { const { data } = await supabase.storage.from('documents').createSignedUrls(k, 3600); const m: Record<string, string> = {}; data?.forEach(d => { if (d.path && d.signedUrl) m[d.path] = d.signedUrl }); return m } })
  const ext: Record<string, string> = {}; paths.forEach(p => { if (p?.startsWith('http')) ext[p] = p }); return { data: { ...(q.data ?? {}), ...ext } as Record<string, string> } }
export function useCreateUnit() { const { orgId } = useAuth(); const qc = useQueryClient()
  return useMutation({ mutationFn: async (v: { name: string; type: string; bedrooms: number; bathrooms: number; rent: number; building: string; photo?: File | null }) => {
    let building_id: string | null = null
    if (v.building) { const { data: b, error: e1 } = await supabase.from('buildings').select('id').eq('name', v.building).maybeSingle(); if (e1) throw e1
      building_id = b?.id ?? (await supabase.from('buildings').insert({ org_id: orgId, name: v.building }).select('id').single()).data?.id ?? null }
    let photo_path: string | null = null
    if (v.photo) { if (v.photo.size > 8e6) throw new Error('La foto supera 8 MB'); photo_path = `${orgId}/photos/${Date.now()}-${v.photo.name.replace(/[^\w.-]/g, '_')}`; const u = await supabase.storage.from('documents').upload(photo_path, v.photo); if (u.error) throw u.error }
    const { error } = await supabase.from('units').insert({ org_id: orgId, name: v.name, type: v.type, bedrooms: v.bedrooms, bathrooms: v.bathrooms, rent: v.rent, building_id, photo_path }); if (error) throw error },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['units'] }) }) }
export function useSetStatus() { const qc = useQueryClient(); return useMutation({ mutationFn: async (v: { id: string; status: string }) => { const { error } = await supabase.from('units').update({ status: v.status }).eq('id', v.id); if (error) throw error }, onSuccess: () => qc.invalidateQueries({ queryKey: ['units'] }) }) }
