import { ReactNode } from 'react'
import { Inbox } from 'lucide-react'
export const PageHeader = ({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) => (
  <div className="mb-6 flex items-end justify-between gap-3"><div><h1 className="text-[32px] font-bold leading-tight tracking-[-0.025em] text-ink sm:text-[34px]">{title}</h1>{sub && <p className="mt-0.5 text-[15px] text-slate-500">{sub}</p>}</div>{action}</div>)
export const Empty = ({ text }: { text: string }) => (<div className="card py-14 text-center"><div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-black/5 text-slate-400"><Inbox size={26} strokeWidth={1.6} /></div><p className="mx-auto max-w-xs text-[15px] text-slate-500">{text}</p></div>)
export const Badge = ({ children, tone = 'slate' }: { children: ReactNode; tone?: 'slate' | 'green' | 'amber' | 'red' | 'blue' }) => {
  const t = { slate: 'bg-black/5 text-slate-600', green: 'bg-[#e8f8ed] text-[#1d8a3e]', amber: 'bg-[#fff3e0] text-[#b36200]', red: 'bg-[#ffebea] text-[#d70015]', blue: 'bg-[#e8f2fd] text-[#0058b0]' }[tone]
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${t}`}>{children}</span> }
