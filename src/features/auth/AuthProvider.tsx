import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
type Ctx = { session: Session | null; loading: boolean; orgId: string | null; orgName: string; refresh: () => void }
const C = createContext<Ctx>({ session: null, loading: true, orgId: null, orgName: '', refresh: () => {} })
export const useAuth = () => useContext(C)
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null); const [loading, setLoading] = useState(true); const qc = useQueryClient()
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false) })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => { setSession(s); qc.clear() })
    return () => sub.subscription.unsubscribe()
  }, [])
  const m = useQuery({ queryKey: ['membership', session?.user.id], enabled: !!session, queryFn: async () => {
    const { data, error } = await supabase.from('organization_members').select('org_id, organizations(name)').limit(1)
    if (error) throw error; return data?.[0] ?? null } })
  const row: any = m.data
  return <C.Provider value={{ session, loading: loading || (!!session && m.isLoading), orgId: row?.org_id ?? null, orgName: row?.organizations?.name ?? '', refresh: () => qc.invalidateQueries({ queryKey: ['membership'] }) }}>{children}</C.Provider>
}
