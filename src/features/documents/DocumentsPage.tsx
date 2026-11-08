import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FileText, Trash2, Upload } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../auth/AuthProvider'
import { Badge, Empty, PageHeader } from '../../components/ui'
export default function DocumentsPage() {
  const { orgId } = useAuth(); const qc = useQueryClient(); const ref = useRef<HTMLInputElement>(null); const [kind, setKind] = useState('contrato'); const [err, setErr] = useState('')
  const d = useQuery({ queryKey: ['docs'], queryFn: async () => { const { data, error } = await supabase.from('documents').select('*').order('created_at', { ascending: false }); if (error) throw error; return data as any[] } })
  const up = useMutation({ mutationFn: async (file: File) => {
    if (file.size > 20e6) throw new Error('El archivo supera 20 MB')
    const path = `${orgId}/${Date.now()}-${file.name.replace(/[^\w.-]/g, '_')}`
    const u = await supabase.storage.from('documents').upload(path, file); if (u.error) throw u.error
    const { error } = await supabase.from('documents').insert({ org_id: orgId, name: file.name, kind, path }); if (error) throw error }, onSuccess: () => { setErr(''); qc.invalidateQueries({ queryKey: ['docs'] }) }, onError: (e: Error) => setErr(e.message) })
  const del = useMutation({ mutationFn: async (x: any) => { if (!confirm('¿Eliminar este documento?')) return; await supabase.storage.from('documents').remove([x.path]); await supabase.from('documents').delete().eq('id', x.id) }, onSuccess: () => qc.invalidateQueries({ queryKey: ['docs'] }) })
  const open = async (p: string) => { const { data } = await supabase.storage.from('documents').createSignedUrl(p, 60); if (data) window.open(data.signedUrl, '_blank') }
  return (<div><PageHeader title="Documentos" sub="Almacenamiento privado" action={<button className="btn flex items-center gap-1" disabled={up.isPending} onClick={() => ref.current?.click()}><Upload size={18} />{up.isPending ? 'Subiendo…' : 'Subir'}</button>} />
    <input ref={ref} type="file" hidden onChange={e => { const f = e.target.files?.[0]; if (f) up.mutate(f); e.target.value = '' }} />
    <select className="inp mb-4" value={kind} onChange={e => setKind(e.target.value)} aria-label="Tipo de documento">{['contrato', 'identificación', 'comprobante', 'fotografía', 'otro'].map(k => <option key={k}>{k}</option>)}</select>
    {err && <p className="mb-3 text-sm text-red-600">{err}</p>}
    {!d.data?.length ? <Empty text="Sube contratos, identificaciones y comprobantes. Solo tu equipo puede verlos." /> : <div className="space-y-3">{d.data.map(x => <div key={x.id} className="card flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-brand"><FileText size={18} /></div>
      <button className="min-w-0 flex-1 text-left" onClick={() => open(x.path)}><b className="block truncate">{x.name}</b><p className="text-xs text-slate-500">{new Date(x.created_at).toLocaleDateString('es-DO')}</p></button><Badge>{x.kind}</Badge>
      <button aria-label="Eliminar" className="p-2 text-slate-400" onClick={() => del.mutate(x)}><Trash2 size={18} /></button></div>)}</div>}</div>)
}
