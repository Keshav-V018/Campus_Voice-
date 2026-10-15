import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react'
import * as D from './data'
const KEY = 'pv-demo-v1'
const fresh = () => JSON.parse(JSON.stringify({ users: D.users, companies: D.companies, drives: D.drives, apps: D.apps, notes: D.notes, anns: D.anns, saved: [{ u: 's1', d: 'd3' }], me: null }))
const load = () => { try { const s = localStorage.getItem(KEY); if (s) return JSON.parse(s) } catch {} return fresh() }
const Ctx = createContext<any>(null)
export const useApp = () => useContext(Ctx)
const now = () => new Date().toISOString()

export function Provider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<any>(load)
  const [toast, setToast] = useState('')
  const t = useRef<any>()
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(db)) } catch {} }, [db])
  const flash = (m: string) => { setToast(m); clearTimeout(t.current); t.current = setTimeout(() => setToast(''), 2800) }
  const me = db.users.find((u: any) => u.id === db.me) || null
  const up = (fn: (d: any) => void) => setDb((p: any) => { const n = JSON.parse(JSON.stringify(p)); fn(n); return n })
  const notify = (d: any, userId: string, title: string, message: string, driveId?: string) => d.notes.unshift({ id: D.uid('n'), userId, title, message, driveId, read: false, at: now() })
  const A: any = {
    db, me, toast, flash,
    login: (email: string, password: string) => {
      const u = db.users.find((x: any) => x.email.toLowerCase() === email.trim().toLowerCase() && x.password === password)
      if (!u) return { error: 'Email or password is incorrect.' }
      up(d => { d.me = u.id }); return { user: u }
    },
    logout: () => up(d => { d.me = null }),
    register: (f: any) => {
      if (db.users.some((x: any) => x.email.toLowerCase() === f.email.toLowerCase())) return { error: 'An account with this email already exists.' }
      if (db.users.some((x: any) => x.usn && x.usn.toLowerCase() === f.usn.toLowerCase())) return { error: 'This USN is already registered.' }
      const u = { ...f, id: D.uid('s'), role: 'student', resume: '', phone: '', createdAt: now() }
      up(d => { d.users.push(u); d.me = u.id; notify(d, u.id, 'Welcome to Placement Voice', 'Upload your resume to start applying to drives.') }); return { user: u }
    },
    updateProfile: (p: any) => up(d => { Object.assign(d.users.find((u: any) => u.id === d.me), p) }),
    apply: (driveId: string, answers: string) => {
      const d = db.drives.find((x: any) => x.id === driveId)
      if (!me) return { error: 'Sign in to apply.' }
      if (!d || d.status !== 'published') return { error: 'This drive is not open for applications.' }
      if (now() < d.opensAt) return { error: 'Applications have not opened yet.' }
      if (now() > d.deadline) return { error: 'The application deadline has passed.' }
      if (!D.isEligible(me, d)) return { error: 'Your profile does not meet the eligibility criteria.' }
      if (!me.resume) return { error: 'Upload a resume in your profile first.' }
      if (db.apps.some((a: any) => a.driveId === driveId && a.studentId === me.id)) return { error: 'You have already applied to this drive.' }
      const app = { id: D.uid('a'), ref: `PV-26-${1000 + db.apps.length * 7 + Math.floor(Math.random() * 6)}`, driveId, studentId: me.id, status: 'Applied', appliedAt: now(), history: [{ status: 'Applied', at: now() }], notes: '', answers }
      const co = db.companies.find((c: any) => c.id === d.companyId)
      up(x => { x.apps.push(app); notify(x, 'a1', 'New application', `${me.name} applied for ${d.title} at ${co?.name}.`, d.id); notify(x, me.id, 'Application submitted', `Reference ${app.ref} for ${d.title} at ${co?.name}.`, d.id) })
      return { app }
    },
    withdraw: (id: string) => up(d => { const a = d.apps.find((x: any) => x.id === id); a.status = 'Withdrawn'; a.history.push({ status: 'Withdrawn', at: now() }) }),
    setStatus: (id: string, status: string, notes?: string) => up(d => {
      const a = d.apps.find((x: any) => x.id === id); if (notes !== undefined) a.notes = notes
      if (a.status !== status) { a.status = status; a.history.push({ status, at: now() })
        const dr = d.drives.find((x: any) => x.id === a.driveId); notify(d, a.studentId, `Status updated: ${status}`, `Your application for ${dr.title} is now "${status}".`, dr.id) } }),
    saveDrive: (dr: any) => { const id = dr.id || D.uid('d'); up(d => { const i = d.drives.findIndex((x: any) => x.id === id); const v = { ...dr, id, updatedAt: now() }; i >= 0 ? (d.drives[i] = v) : d.drives.unshift(v)
      if (v.status === 'published' && (i < 0 || d.drives[i]?.status !== 'published' || true) && !(db.drives.find((x: any) => x.id === id)?.status === 'published')) d.users.filter((u: any) => u.role === 'student' && D.isEligible(u, v)).forEach((u: any) => notify(d, u.id, `New drive: ${v.title}`, `${d.companies.find((c: any) => c.id === v.companyId)?.name} is hiring. You are eligible to apply.`, id)) }); return id },
    driveStatus: (id: string, status: string) => up(d => { const x = d.drives.find((v: any) => v.id === id); x.status = status; x.updatedAt = now() }),
    saveCompany: (c: any) => { const id = c.id || D.uid('c'); up(d => { const i = d.companies.findIndex((x: any) => x.id === id); const v = { color: '#2A52D4', ...c, id }; i >= 0 ? (d.companies[i] = v) : d.companies.unshift(v) }); return id },
    toggleSave: (driveId: string) => up(d => { const i = d.saved.findIndex((s: any) => s.u === d.me && s.d === driveId); i >= 0 ? d.saved.splice(i, 1) : d.saved.push({ u: d.me, d: driveId }) }),
    isSaved: (driveId: string) => db.saved.some((s: any) => s.u === db.me && s.d === driveId),
    read: (id?: string) => up(d => d.notes.forEach((n: any) => { if (n.userId === d.me && (!id || n.id === id)) n.read = true })),
    announce: (a: any) => up(d => { d.anns.unshift({ ...a, id: D.uid('an'), at: now() })
      const dr = d.drives.find((x: any) => x.id === a.driveId)
      const targets = a.driveId ? d.apps.filter((x: any) => x.driveId === a.driveId).map((x: any) => x.studentId) : d.users.filter((u: any) => u.role === 'student').map((u: any) => u.id)
      ;[...new Set(targets)].forEach((id: any) => notify(d, id, a.title, a.content.slice(0, 120), a.driveId)) }),
    reset: () => { setDb(fresh()); flash('Demo data restored') },
    company: (id: string) => db.companies.find((c: any) => c.id === id),
    drive: (id: string) => db.drives.find((d: any) => d.id === id),
    user: (id: string) => db.users.find((u: any) => u.id === id)
  }
  return <Ctx.Provider value={A}>{children}</Ctx.Provider>
}
