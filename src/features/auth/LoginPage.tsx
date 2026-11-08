import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import Logo from '../../components/Logo'
const schema = z.object({ name: z.string().optional(), email: z.string().email('Ingresa un correo válido'), password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres') })
type F = z.infer<typeof schema>
const tr = (m: string) => /invalid login/i.test(m) ? 'Correo o contraseña incorrectos.' : /not confirmed/i.test(m) ? 'Confirma tu correo antes de entrar.' : /already registered/i.test(m) ? 'Este correo ya tiene una cuenta.' : /rate limit/i.test(m) ? 'Demasiados intentos. Espera un momento.' : m
export default function LoginPage() {
  const [mode, setMode] = useState<'in' | 'up'>('in'); const [show, setShow] = useState(false); const [msg, setMsg] = useState<{ t: 'err' | 'ok'; s: string } | null>(null)
  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm<F>({ resolver: zodResolver(schema) })
  const onSubmit = async (v: F) => {
    setMsg(null)
    const r = mode === 'in' ? await supabase.auth.signInWithPassword({ email: v.email, password: v.password }) : await supabase.auth.signUp({ email: v.email, password: v.password, options: { data: { full_name: v.name } } })
    if (r.error) setMsg({ t: 'err', s: tr(r.error.message) }); else if (mode === 'up' && !r.data.session) setMsg({ t: 'ok', s: 'Cuenta creada. Revisa tu correo para confirmarla.' })
  }
  const forgot = async () => { const e = getValues('email'); if (!/^\S+@\S+\.\S+$/.test(e || '')) return setMsg({ t: 'err', s: 'Escribe tu correo y vuelve a tocar “¿Olvidaste tu contraseña?”.' })
    const { error } = await supabase.auth.resetPasswordForEmail(e, { redirectTo: window.location.origin }); setMsg(error ? { t: 'err', s: tr(error.message) } : { t: 'ok', s: 'Te enviamos un enlace para restablecer tu contraseña.' }) }
  const err = errors.email?.message || errors.password?.message
  return (<div className="relative flex min-h-screen items-center justify-center bg-[#f5f5f7] px-5 py-10 pt-[max(2.5rem,env(safe-area-inset-top))]">
    <div className="w-full max-w-[400px]">
      <div className="mb-8 text-center"><div className="mx-auto mb-6 grid h-[88px] w-[88px] place-items-center rounded-[22px] bg-white shadow-card"><Logo size={56} /></div>
        <h1 className="text-[30px] font-bold tracking-[-0.025em]">{mode === 'in' ? 'Inicia sesión' : 'Crea tu cuenta'}</h1><p className="mt-1.5 text-[16px] text-slate-500">{mode === 'in' ? 'Accede a tu espacio en PropiaApp.' : 'Empieza a administrar tu inmobiliaria.'}</p></div>
      <div className="mb-5 grid grid-cols-2 rounded-[10px] bg-black/[.06] p-0.5 text-[14px] font-medium" role="tablist">{(['in', 'up'] as const).map(m => <button key={m} role="tab" aria-selected={mode === m} type="button" onClick={() => { setMode(m); setMsg(null) }} className={`min-h-[36px] rounded-[8px] transition ${mode === m ? 'bg-white text-ink shadow-sm' : 'text-slate-500'}`}>{m === 'in' ? 'Iniciar sesión' : 'Crear cuenta'}</button>)}</div>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="divide-y divide-black/5 overflow-hidden rounded-2xl bg-white shadow-card transition focus-within:ring-4 focus-within:ring-brand/15">
          {mode === 'up' && <input className="gin" autoComplete="name" placeholder="Nombre completo" aria-label="Nombre completo" {...register('name')} />}
          <input className="gin" type="email" inputMode="email" autoComplete="email" placeholder="Correo electrónico" aria-label="Correo electrónico" {...register('email')} />
          <div className="relative"><input className="gin pr-14" type={show ? 'text' : 'password'} autoComplete={mode === 'in' ? 'current-password' : 'new-password'} placeholder="Contraseña" aria-label="Contraseña" {...register('password')} />
            <button type="button" aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'} className="absolute right-1 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center text-slate-400" onClick={() => setShow(!show)}>{show ? <EyeOff size={20} /> : <Eye size={20} />}</button></div></div>
        {err && <p role="alert" className="mt-3 px-1 text-[14px] text-[#d70015]">{err}</p>}
        {msg && <p role="alert" className={`mt-3 rounded-xl px-4 py-3 text-[14px] ${msg.t === 'err' ? 'bg-[#ffebea] text-[#d70015]' : 'bg-[#e8f8ed] text-[#1d8a3e]'}`}>{msg.s}</p>}
        <button className="btn mt-5 w-full min-h-[52px] text-[17px]" disabled={isSubmitting}>{isSubmitting ? 'Un momento…' : mode === 'in' ? 'Continuar' : 'Crear cuenta'}</button></form>
      {mode === 'in' && <div className="mt-5 text-center"><button type="button" className="text-[15px] text-brand" onClick={forgot}>¿Olvidaste tu contraseña?</button></div>}
      <p className="mt-10 text-center text-[12px] text-slate-400">PropiaApp · Gestión inmobiliaria · República Dominicana</p></div></div>)
}
