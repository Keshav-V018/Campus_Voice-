import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, ArrowRight, MapPin, CheckCircle2, ChevronDown } from 'lucide-react'
import { useApp } from '../store'
import { BRANCHES, daysLeft, fmtDate } from '../data'
import { Mono, Field, Logo } from '../ui'

export function Landing() {
  const { db, company, me } = useApp(); const nav = useNavigate(); const [q, setQ] = useState('')
  const pub = db.drives.filter((d: any) => d.status === 'published')
  const upcoming = [...pub].sort((a, b) => +new Date(a.deadline) - +new Date(b.deadline)).slice(0, 6)
  const go = (e: any) => { e.preventDefault(); nav(me ? `/drives?q=${encodeURIComponent(q)}` : '/login', { state: { from: `/drives?q=${encodeURIComponent(q)}` } }) }
  const steps = ['Applied', 'Shortlisted', 'Interview', 'Selected']
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-white">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_.9fr] lg:py-24">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-1.5 text-sm font-medium text-navy-700"><span className="h-2 w-2 rounded-full bg-amber-500" />Placement season 2026–27 is open</p>
            <h1 className="text-5xl font-extrabold leading-[1.02] sm:text-6xl lg:text-7xl">Apply on campus.<br />Hear back from the cell.</h1>
            <p className="mt-6 max-w-xl text-lg text-slate-600">Browse every recruitment drive, see at a glance whether you are eligible, apply in a minute, and follow each round until the offer letter arrives.</p>
            <form onSubmit={go} className="mt-8 flex max-w-xl flex-col gap-2 rounded-3xl border border-slate-200 bg-white p-2 shadow-soft sm:flex-row sm:rounded-full" role="search">
              <div className="flex flex-1 items-center gap-2 px-4"><Search size={18} className="text-slate-400" /><input aria-label="Search company or job role" value={q} onChange={e => setQ(e.target.value)} placeholder="Search a company or job role" className="w-full bg-transparent py-3 text-sm outline-none" /></div>
              <button className="btn btn-primary">Find drives</button>
            </form>
            <div className="mt-6 flex flex-wrap gap-3"><Link to="/register" className="btn btn-amber">Create student account<ArrowRight size={16} /></Link><Link to="/login" className="btn btn-ghost">Log in</Link></div>
          </div>
          <div className="relative mx-auto w-full max-w-md" aria-hidden="true">
            <div className="absolute -inset-4 rotate-3 rounded-[2rem] bg-brand-100" />
            <div className="relative rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-soft">
              <Logo size={30} /><p className="mt-8 text-sm text-slate-500">Dear Aarav,</p>
              <p className="mt-2 text-sm text-slate-500">We are pleased to offer you the role of</p>
              <h3 className="mt-1 text-3xl font-extrabold">Software Engineer</h3>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm"><div className="rounded-xl bg-brand-50 p-3"><p className="text-xs text-slate-500">Package</p><p className="font-bold text-ink">₹14 LPA</p></div><div className="rounded-xl bg-brand-50 p-3"><p className="text-xs text-slate-500">Company</p><p className="font-bold text-ink">Northwind Labs</p></div></div>
              <div className="mt-6 flex gap-2">{steps.map((s, i) => <span key={s} className="stage flex-1 rounded-full py-1.5 text-center text-[11px] font-semibold" style={{ animationDelay: `${i * 1.1}s` }}>{s}</span>)}</div>
              <p className="mt-4 text-center text-xs text-slate-400">Sample illustration</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-100 bg-white"><div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-10 sm:px-6 md:grid-cols-4">
        {[[pub.length, 'Published drives'], [new Set(pub.map((d: any) => d.companyId)).size, 'Participating companies'], [db.users.filter((u: any) => u.role === 'student').length, 'Registered students'], [db.apps.length, 'Applications so far']].map(([n, l]: any) => <div key={l}><p className="font-display text-5xl font-extrabold text-ink">{n}</p><p className="mt-1 text-sm text-slate-500">{l}</p></div>)}
      </div></section>

      <div className="overflow-hidden border-b border-slate-100 bg-brand-50/50 py-5" aria-label="Participating companies"><div className="marquee flex w-max gap-10">{[...db.companies, ...db.companies].map((c: any, i: number) => <span key={i} className="flex items-center gap-3 font-display text-lg font-bold text-ink/70"><Mono c={c} size={32} />{c.name}</span>)}</div></div>

      <section id="drives" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-4xl font-extrabold">Closing soon</h2><p className="mt-2 text-slate-500">Upcoming campus drives, sorted by application deadline. Sample records.</p></div><Link to={me ? '/drives' : '/login'} className="btn btn-ghost">See all drives</Link></div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{upcoming.map((d: any) => { const c = company(d.companyId); const dl = daysLeft(d.deadline); return (
          <Link key={d.id} to={me ? `/drives/${d.id}` : '/login'} state={{ from: `/drives/${d.id}` }} className="card group p-6 transition hover:border-brand-400">
            <div className="flex items-center gap-3"><Mono c={c} /><div><p className="font-semibold text-ink">{c?.name}</p><p className="text-xs text-slate-500">{c?.industry}</p></div></div>
            <h3 className="mt-5 text-xl font-bold">{d.title}</h3>
            <div className="mt-3 flex flex-wrap gap-2"><span className="chip">{d.lpa ? `₹${d.lpa} LPA` : `₹${(d.stipend / 1000).toFixed(0)}k / month`}</span><span className="chip"><MapPin size={12} />{d.location}</span><span className="chip">{d.type}</span></div>
            <p className="mt-5 text-sm text-slate-500">Apply by {fmtDate(d.deadline)} · <span className={dl <= 7 ? 'font-semibold text-amber-600' : ''}>{dl} days left</span></p>
          </Link>) })}</div>
      </section>

      <section id="how" className="bg-ink py-20 text-white"><div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="max-w-2xl text-4xl font-extrabold text-white">From registration to offer letter in four steps</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-4">{[['Register', 'Sign up with your USN and fill in your academic details once.'], ['Check eligibility', 'Every drive shows whether your branch, CGPA and backlogs qualify, and why not.'], ['Apply', 'Attach your resume, answer a question or two, and get an application reference.'], ['Track', 'Follow shortlists, test and interview schedules, and notifications in one place.']].map(([t, d], i) => (
          <div key={t} className="rounded-3xl bg-white/5 p-6"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-400 font-bold text-ink">{i + 1}</span><h3 className="mt-5 text-xl font-bold text-white">{t}</h3><p className="mt-2 text-sm text-slate-300">{d}</p></div>))}</div>
      </div></section>

      <section id="faq" className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <h2 className="text-center text-4xl font-extrabold">Help centre</h2>
        <div className="mt-8 space-y-3">{[['Who can use Placement Voice?', 'Students of the college register with their USN. The placement cell accounts are created by the college administrator.'], ['Can I apply to more than one drive?', 'Yes. You can apply to every drive you are eligible for, but only once per drive. Some drives have a one-offer policy that the cell will announce.'], ['How is my resume stored?', 'Resumes are stored privately and are visible only to you and the placement cell.'], ['I do not meet a criterion. What now?', 'The drive page shows which criterion is unmet. Contact the placement cell if your records are out of date.']].map(([q, a]) => <details key={q} className="card group p-5"><summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-ink">{q}<ChevronDown size={18} className="transition group-open:rotate-180" /></summary><p className="mt-3 text-sm text-slate-600">{a}</p></details>)}</div>
      </section>
    </>
  )
}

const card = 'mx-auto my-12 w-full max-w-md px-4'
export function Login() {
  const { login } = useApp(); const nav = useNavigate(); const loc: any = useLocation()
  const [f, setF] = useState({ email: '', password: '' }); const [err, setErr] = useState('')
  const submit = (e: any) => { e.preventDefault(); const r = login(f.email, f.password); if (r.error) return setErr(r.error)
    nav(r.user.role === 'admin' ? '/admin/dashboard' : loc.state?.from || '/dashboard', { replace: true }) }
  const fill = (email: string, password: string) => setF({ email, password })
  return (
    <div className={card}><div className="card p-8">
      <h1 className="text-3xl font-extrabold">Welcome back</h1><p className="mt-1 text-sm text-slate-500">Log in to continue to your dashboard.</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <Field label="College email"><input type="email" required autoComplete="email" className="input" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} /></Field>
        <Field label="Password"><input type="password" required autoComplete="current-password" className="input" value={f.password} onChange={e => setF({ ...f, password: e.target.value })} /></Field>
        {err && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{err}</p>}
        <button className="btn btn-primary w-full">Log in</button>
      </form>
      <div className="mt-6 rounded-2xl bg-brand-50 p-4 text-sm"><p className="mb-2 font-semibold text-ink">Demo accounts</p><div className="flex flex-wrap gap-2"><button className="btn btn-ghost btn-sm" onClick={() => fill('aarav@student.edu', 'student123')}>Use student</button><button className="btn btn-ghost btn-sm" onClick={() => fill('placement@college.edu', 'admin123')}>Use admin</button></div></div>
      <p className="mt-5 text-center text-sm text-slate-500">New student? <Link className="font-semibold text-brand-600" to="/register">Create an account</Link></p>
    </div></div>
  )
}
export function Register() {
  const { register } = useApp(); const nav = useNavigate()
  const [f, setF] = useState<any>({ name: '', email: '', password: '', usn: '', branch: 'CSE', year: 2027, cgpa: '', backlogs: 0 }); const [e, setE] = useState<any>({}); const [srv, setSrv] = useState('')
  const set = (k: string) => (ev: any) => setF({ ...f, [k]: ev.target.value })
  const submit = (ev: any) => { ev.preventDefault(); const x: any = {}
    if (f.name.trim().length < 3) x.name = 'Enter your full name.'
    if (!/^\S+@\S+\.\S+$/.test(f.email)) x.email = 'Enter a valid email.'
    if (f.password.length < 8) x.password = 'Use at least 8 characters.'
    if (!/^[A-Za-z0-9]{8,12}$/.test(f.usn)) x.usn = 'USN should be 8–12 letters or digits.'
    if (!(+f.cgpa >= 0 && +f.cgpa <= 10) || f.cgpa === '') x.cgpa = 'CGPA must be between 0 and 10.'
    setE(x); if (Object.keys(x).length) return
    const r = register({ ...f, usn: f.usn.toUpperCase(), year: +f.year, cgpa: +f.cgpa, backlogs: +f.backlogs }); if (r.error) return setSrv(r.error); nav('/dashboard') }
  return (
    <div className="mx-auto my-12 w-full max-w-2xl px-4"><div className="card p-8">
      <h1 className="text-3xl font-extrabold">Create your student account</h1><p className="mt-1 text-sm text-slate-500">Eligibility is checked against these details, so keep them accurate.</p>
      <form onSubmit={submit} noValidate className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Full name" error={e.name}><input className="input" value={f.name} onChange={set('name')} /></Field>
        <Field label="USN" error={e.usn}><input className="input uppercase" value={f.usn} onChange={set('usn')} /></Field>
        <Field label="Email" error={e.email}><input type="email" className="input" value={f.email} onChange={set('email')} /></Field>
        <Field label="Password" error={e.password}><input type="password" className="input" value={f.password} onChange={set('password')} /></Field>
        <Field label="Branch"><select className="input" value={f.branch} onChange={set('branch')}>{BRANCHES.map(b => <option key={b}>{b}</option>)}</select></Field>
        <Field label="Graduation year"><select className="input" value={f.year} onChange={set('year')}>{[2026, 2027, 2028].map(y => <option key={y}>{y}</option>)}</select></Field>
        <Field label="CGPA" error={e.cgpa}><input inputMode="decimal" className="input" value={f.cgpa} onChange={set('cgpa')} placeholder="e.g. 8.2" /></Field>
        <Field label="Active backlogs"><input type="number" min={0} max={10} className="input" value={f.backlogs} onChange={set('backlogs')} /></Field>
        {srv && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700 sm:col-span-2">{srv}</p>}
        <button className="btn btn-primary sm:col-span-2">Create account</button>
      </form>
      <p className="mt-5 text-center text-sm text-slate-500">Already registered? <Link className="font-semibold text-brand-600" to="/login">Log in</Link></p>
    </div></div>
  )
}
