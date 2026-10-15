import { ReactNode, useEffect, useState } from 'react'
import { X, CheckCircle2, Inbox } from 'lucide-react'
import { useApp } from './store'

export const Logo = ({ light = false, size = 36 }: { light?: boolean; size?: number }) => (
  <span className="inline-flex items-center gap-2.5">
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="11" fill={light ? '#fff' : '#0B1F4B'} /><path d="M20 7 5 14.5 20 22l15-7.500z" fill={light ? '#0B1F4B' : '#fff'} /><path d="M11.500 19.500v5.200c0 2.200 3.800 4 8.500 4s8.500-1.800 8.500-4v-5.200L20 24z" fill="#6B93FF" /><path d="M35 15v8" stroke="#FFC53D" strokeWidth="2" strokeLinecap="round" /><path d="M14 33v2M20 32v4M26 33v2" stroke="#FFC53D" strokeWidth="2" strokeLinecap="round" /></svg>
    <span className={`font-display text-xl font-extrabold tracking-tight ${light ? 'text-white' : 'text-ink'}`}>Campus   Voice</span>
  </span>
)
export const Mono = ({ c, size = 44 }: { c: any; size?: number }) => (
  <span className="inline-flex shrink-0 items-center justify-center rounded-xl font-display font-bold text-white" style={{ width: size, height: size, background: c?.color || '#0B1F4B', fontSize: size * 0.38 }} aria-hidden="true">{(c?.name || '?').split(' ').map((w: string) => w[0]).slice(0, 2).join('')}</span>
)
const tone: any = { Applied: 'bg-slate-100 text-slate-700', 'Under Review': 'bg-amber-50 text-amber-700', Shortlisted: 'bg-brand-100 text-brand-600', 'Assessment Scheduled': 'bg-violet-50 text-violet-700', 'Interview Scheduled': 'bg-indigo-50 text-indigo-700', Selected: 'bg-emerald-50 text-emerald-700', Rejected: 'bg-red-50 text-red-700', Withdrawn: 'bg-slate-100 text-slate-500', published: 'bg-emerald-50 text-emerald-700', draft: 'bg-slate-100 text-slate-600', closed: 'bg-amber-50 text-amber-700', cancelled: 'bg-red-50 text-red-700' }
export const Badge = ({ s }: { s: string }) => <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${tone[s] || tone.Applied}`}>{s}</span>
export const PageHead = ({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>{sub && <p className="mt-1 text-slate-500">{sub}</p>}</div>{action}</div>
)
export const Empty = ({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) => (
  <div className="card flex flex-col items-center px-6 py-14 text-center"><Inbox className="mb-3 text-brand-400" size={36} /><h3 className="text-lg font-semibold">{title}</h3>{hint && <p className="mt-1 max-w-sm text-sm text-slate-500">{hint}</p>}{action && <div className="mt-4">{action}</div>}</div>
)
export const Field = ({ label, error, children, hint }: { label: string; error?: string; children: ReactNode; hint?: string }) => (
  <label className="block"><span className="label">{label}</span>{children}{hint && !error && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}{error && <span role="alert" className="mt-1 block text-xs font-medium text-red-600">{error}</span>}</label>
)
export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  useEffect(() => { if (!open) return; const f = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', f); return () => window.removeEventListener('keydown', f) }, [open])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-0 sm:items-center sm:p-4" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={title} className={`max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl ${wide ? 'sm:max-w-2xl' : 'sm:max-w-lg'}`}>
        <div className="mb-4 flex items-start justify-between gap-4"><h2 className="text-xl font-bold">{title}</h2><button onClick={onClose} aria-label="Close" className="rounded-full p-1.5 hover:bg-slate-100"><X size={18} /></button></div>{children}
      </div>
    </div>
  )
}
export const Toast = () => { const { toast } = useApp(); return toast ? <div role="status" className="fixed bottom-5 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-white shadow-2xl"><CheckCircle2 size={16} className="text-amber-400" />{toast}</div> : null }
export const useLoading = (ms = 450) => { const [l, s] = useState(true); useEffect(() => { const t = setTimeout(() => s(false), ms); return () => clearTimeout(t) }, []); return l }
export const Skeleton = ({ n = 3 }: { n?: number }) => <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: n }).map((_, i) => <div key={i} className="card h-52 animate-pulse bg-slate-50" />)}</div>
export const Confirm = ({ open, onClose, onYes, title, text, label = 'Confirm', danger }: any) => (
  <Modal open={open} onClose={onClose} title={title}><p className="text-sm text-slate-600">{text}</p><div className="mt-6 flex justify-end gap-2"><button className="btn btn-ghost" onClick={onClose}>Keep as is</button><button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={() => { onYes(); onClose() }}>{label}</button></div></Modal>
)
export const csv = (name: string, rows: any[][]) => {
  const body = rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([body], { type: 'text/csv' })); a.download = name; a.click()
}
export const Pager = ({ page, pages, set }: { page: number; pages: number; set: (n: number) => void }) => pages <= 1 ? null : (
  <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm"><span className="text-slate-500">Page {page} of {pages}</span><div className="flex gap-2"><button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => set(page - 1)}>Previous</button><button className="btn btn-ghost btn-sm" disabled={page >= pages} onClick={() => set(page + 1)}>Next</button></div></div>
)
