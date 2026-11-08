import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import Logo from '../../components/Logo'
import { useAuth } from './AuthProvider'
export default function Onboarding() {
  const [name, setName] = useState(''); const [err, setErr] = useState(''); const { refresh } = useAuth()
  const go = async () => { const { error } = await supabase.rpc('create_organization', { p_name: name }); if (error) setErr(error.message); else refresh() }
  return (<div className="min-h-screen grid place-items-center p-5"><div className="card w-full max-w-sm space-y-3"><div className="flex justify-center"><Logo size={56} /></div><h1 className="text-xl font-bold text-ink">Crea tu inmobiliaria</h1>
    <p className="text-sm text-slate-500">Este será tu espacio de trabajo. Tus datos son privados.</p>
    <input className="inp" placeholder="Nombre de la empresa" value={name} onChange={e => setName(e.target.value)} />{err && <p className="text-sm text-red-600">{err}</p>}
    <button className="btn w-full" disabled={name.length < 2} onClick={go}>Continuar</button></div></div>)
}
