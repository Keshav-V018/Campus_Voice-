import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Plus, Pencil, Eye, Building2, Briefcase, CalendarClock, FileText, Hourglass, Globe } from 'lucide-react'
import { useApp } from '../store'
import { BRANCHES, JOB_TYPES, DOCS, fmtDate, fmtDT, daysLeft, toInput, fromInput } from '../data'
import { Mono, Badge, PageHead, Empty, Field, Modal, Confirm, useLoading } from '../ui'

export function AdminDash() {
  const { db, company } = useApp(); const pub = db.drives.filter((d: any) => d.status === 'published')
  const pending = db.apps.filter((a: any) => ['Applied', 'Under Review'].includes(a.status))
  const stats: any[] = [['Companies', db.companies.length, Building2], ['Published drives', pub.length, Briefcase], ['Upcoming drives', pub.filter((d: any) => daysLeft(d.deadline) >= 0).length, CalendarClock], ['Applications', db.apps.length, FileText], ['Awaiting review', pending.length, Hourglass]]
  const recent = [...db.drives].sort((a: any, b: any) => +new Date(b.updatedAt) - +new Date(a.updatedAt)).slice(0, 5)
  return (
    <>
      <PageHead title="Dashboard" sub="Live numbers from the sample database." action={<Link to="/admin/drives/new" className="btn btn-primary"><Plus size={16} />New drive</Link>} />
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-5">{stats.map(([l, n, I]) => <div key={l} className="card p-5"><I size={20} className="text-brand-500" /><p className="mt-3 font-display text-4xl font-extrabold text-ink">{n}</p><p className="text-sm text-slate-500">{l}</p></div>)}</div>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-5"><h2 className="mb-3 text-lg font-bold">Recently updated drives</h2>{recent.map((d: any) => <Link key={d.id} to={`/admin/drives/${d.id}/edit`} className="flex items-center gap-3 border-t border-slate-100 py-3 first:border-0"><Mono c={company(d.companyId)} size={36} /><span className="min-w-0 flex-1"><b className="block truncate text-ink">{d.title}</b><span className="text-xs text-slate-500">{company(d.companyId)?.name} · {fmtDT(d.updatedAt)}</span></span><Badge s={d.status} /></Link>)}</section>
        <section className="card p-5"><div className="mb-3 flex justify-between"><h2 className="text-lg font-bold">Waiting for review</h2><Link to="/admin/applications" className="text-sm font-semibold text-brand-600">Open queue</Link></div>{pending.length ? pending.slice(0, 5).map((a: any) => { const s = db.users.find((u: any) => u.id === a.studentId); return <div key={a.id} className="flex items-center justify-between border-t border-slate-100 py-3 text-sm first:border-0"><span><b className="text-ink">{s?.name}</b><br /><span className="text-slate-500">{db.drives.find((d: any) => d.id === a.driveId)?.title}</span></span><Badge s={a.status} /></div> }) : <p className="text-sm text-slate-500">Every application has been reviewed.</p>}</section>
      </div>
    </>
  )
}

export function AdminCompanies() {
  const { db, saveCompany, flash } = useApp(); const [m, setM] = useState<any>(null); const [e, setE] = useState<any>({}); const [q, setQ] = useState('')
  const save = () => { const x: any = {}; if (!m.name?.trim()) x.name = 'Company name is required.'; if (m.website && !/^https?:\/\//.test(m.website)) x.website = 'Start with http:// or https://'; if (!m.industry?.trim()) x.industry = 'Add an industry.'
    setE(x); if (Object.keys(x).length) return; saveCompany(m); flash(m.id ? 'Company updated' : 'Company added'); setM(null) }
  const list = db.companies.filter((c: any) => c.name.toLowerCase().includes(q.toLowerCase()))
  const f = (k: string) => ({ value: m?.[k] || '', onChange: (ev: any) => setM({ ...m, [k]: ev.target.value }) })
  return (
    <>
      <PageHead title="Companies" sub="Company profiles shown on every drive." action={<button className="btn btn-primary" onClick={() => { setE({}); setM({ name: '', industry: '', hq: '', website: '', description: '' }) }}><Plus size={16} />Add company</button>} />
      <input aria-label="Search companies" className="input mb-5 max-w-sm" placeholder="Search companies" value={q} onChange={e => setQ(e.target.value)} />
      {list.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{list.map((c: any) => <div key={c.id} className="card p-5"><div className="flex items-center gap-3"><Mono c={c} /><div className="min-w-0 flex-1"><p className="truncate font-bold text-ink">{c.name}</p><p className="text-xs text-slate-500">{c.industry} · {c.hq}</p></div><button aria-label={`Edit ${c.name}`} className="rounded-full p-2 hover:bg-brand-50" onClick={() => { setE({}); setM(c) }}><Pencil size={16} /></button></div><p className="mt-4 line-clamp-3 text-sm text-slate-600">{c.description}</p><p className="mt-4 text-xs text-slate-500">{db.drives.filter((d: any) => d.companyId === c.id).length} drives</p></div>)}</div> : <Empty title="No companies found" action={<button className="btn btn-primary" onClick={() => setM({ name: '' })}>Add company</button>} />}
      <Modal open={!!m} onClose={() => setM(null)} title={m?.id ? 'Edit company' : 'Add company'}>{m && <div className="space-y-4">
        <Field label="Company name" error={e.name}><input className="input" {...f('name')} /></Field><Field label="Industry" error={e.industry}><input className="input" {...f('industry')} /></Field>
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Headquarters"><input className="input" {...f('hq')} /></Field><Field label="Website" error={e.website}><input className="input" placeholder="https://" {...f('website')} /></Field></div>
        <Field label="Description"><textarea rows={3} className="input" {...f('description')} /></Field>
        <div className="flex justify-end gap-2"><button className="btn btn-ghost" onClick={() => setM(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>Save company</button></div></div>}</Modal>
    </>
  )
}

export function AdminDrives() {
  const { db, company, driveStatus, flash } = useApp(); const [tab, setTab] = useState('all'); const [c, setC] = useState<any>(null); const loading = useLoading(350)
  const list = db.drives.filter((d: any) => tab === 'all' || d.status === tab)
  const act = (d: any, s: string, label: string) => <button className="text-xs font-semibold text-brand-600 hover:underline" onClick={() => setC({ d, s, label })}>{label}</button>
  return (
    <>
      <PageHead title="Drives" sub="Create, publish, close or cancel campus drives." action={<Link to="/admin/drives/new" className="btn btn-primary"><Plus size={16} />New drive</Link>} />
      <div className="mb-4 flex flex-wrap gap-2">{['all', 'draft', 'published', 'closed', 'cancelled'].map(t => <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize ${tab === t ? 'bg-ink text-white' : 'bg-white text-slate-600 hover:bg-brand-100'}`}>{t}</button>)}</div>
      {loading ? <div className="card h-64 animate-pulse bg-slate-50" /> : list.length ? <div className="card overflow-x-auto"><table className="w-full min-w-[760px]"><thead className="border-b border-slate-100"><tr><th className="th">Drive</th><th className="th">Deadline</th><th className="th">Applications</th><th className="th">Status</th><th className="th">Actions</th></tr></thead><tbody>
        {list.map((d: any) => <tr key={d.id} className="border-b border-slate-50 last:border-0"><td className="td"><div className="flex items-center gap-3"><Mono c={company(d.companyId)} size={36} /><span><b className="block text-ink">{d.title}</b><span className="text-xs text-slate-500">{company(d.companyId)?.name}</span></span></div></td><td className="td">{fmtDate(d.deadline)}</td><td className="td">{db.apps.filter((a: any) => a.driveId === d.id).length}</td><td className="td"><Badge s={d.status} /></td>
          <td className="td"><div className="flex flex-wrap gap-3"><Link to={`/admin/drives/${d.id}/edit`} className="text-xs font-semibold text-brand-600 hover:underline">Edit</Link>{d.status === 'draft' && act(d, 'published', 'Publish')}{d.status === 'published' && act(d, 'closed', 'Close')}{d.status === 'closed' && act(d, 'published', 'Reopen')}{['draft', 'published', 'closed'].includes(d.status) && <button className="text-xs font-semibold text-red-600 hover:underline" onClick={() => setC({ d, s: 'cancelled', label: 'Cancel drive', danger: true })}>Cancel</button>}</div></td></tr>)}</tbody></table></div>
        : <Empty title="No drives here" hint="Create a drive and publish it to notify eligible students." action={<Link to="/admin/drives/new" className="btn btn-primary">New drive</Link>} />}
      <Confirm open={!!c} onClose={() => setC(null)} danger={c?.danger} label={c?.label} title={`${c?.label}?`} text={c && `"${c.d.title}" will be marked ${c.s}.`} onYes={() => { driveStatus(c.d.id, c.s); flash(`Drive ${c.s}`) }} />
    </>
  )
}

const empty = (company: string) => ({ companyId: company, title: '', jd: '', resp: '', skills: '', branches: [] as string[], years: [2027] as number[], minCgpa: 6, maxBacklogs: 0, lpa: '', stipend: '', type: 'Full-time', location: '', mode: 'On-site', openings: 10, opensAt: toInput(new Date().toISOString()), deadline: '', rounds: 'Online assessment\nTechnical interview\nHR interview', docs: ['Resume', 'College ID card'] as string[], status: 'draft' })
export function DriveForm() {
  const { id } = useParams(); const { db, drive, company, saveDrive, saveCompany, flash } = useApp(); const nav = useNavigate(); const ex = id ? drive(id) : null
  const [f, setF] = useState<any>(() => ex ? { ...ex, resp: ex.responsibilities.join('\n'), skills: ex.skills.join(', '), rounds: ex.rounds.join('\n'), opensAt: toInput(ex.opensAt), deadline: toInput(ex.deadline), lpa: ex.lpa || '', stipend: ex.stipend || '' } : empty(db.companies[0]?.id))
  const [e, setE] = useState<any>({}); const [prev, setPrev] = useState(false); const [nc, setNc] = useState<any>(null)
  const set = (k: string) => (ev: any) => setF({ ...f, [k]: ev.target.value })
  const tog = (k: string, v: any) => setF({ ...f, [k]: f[k].includes(v) ? f[k].filter((x: any) => x !== v) : [...f[k], v] })
  const lines = (s: string) => s.split('\n').map(x => x.trim()).filter(Boolean)
  const build = (status: string) => ({ ...(ex || {}), id: ex?.id, companyId: f.companyId, title: f.title.trim(), jd: f.jd.trim(), responsibilities: lines(f.resp), skills: f.skills.split(',').map((x: string) => x.trim()).filter(Boolean), branches: f.branches, years: f.years.map(Number), minCgpa: +f.minCgpa, maxBacklogs: +f.maxBacklogs, lpa: +f.lpa || 0, stipend: +f.stipend || 0, type: f.type, location: f.location.trim(), mode: f.mode, openings: +f.openings, opensAt: f.opensAt ? fromInput(f.opensAt) : new Date().toISOString(), deadline: f.deadline ? fromInput(f.deadline) : '', rounds: lines(f.rounds), docs: f.docs, status })
  const validate = () => { const x: any = {}
    if (!f.companyId) x.companyId = 'Select or create a company.'; if (f.title.trim().length < 3) x.title = 'Enter a job role.'; if (f.jd.trim().length < 30) x.jd = 'Describe the role in at least 30 characters.'
    if (!lines(f.resp).length) x.resp = 'Add at least one responsibility.'; if (!f.skills.trim()) x.skills = 'Add at least one skill.'; if (!+f.lpa && !+f.stipend) x.lpa = 'Enter a package or a stipend.'
    if (!f.location.trim()) x.location = 'Enter a work location.'; if (!f.branches.length) x.branches = 'Select at least one branch.'; if (!f.years.length) x.years = 'Select a graduation year.'
    if (+f.minCgpa < 0 || +f.minCgpa > 10) x.minCgpa = 'CGPA must be 0–10.'; if (!lines(f.rounds).length) x.rounds = 'Add at least one round.'
    if (!f.deadline) x.deadline = 'Set a deadline.'; else if (f.opensAt && f.deadline <= f.opensAt) x.deadline = 'Deadline must be after the opening date.'
    setE(x); return !Object.keys(x).length }
  const draft = () => { if (f.title.trim().length < 3) return setE({ title: 'Add a job role before saving a draft.' }); const i = saveDrive(build('draft')); flash('Draft saved'); nav('/admin/drives') }
  const publish = () => { if (!validate()) { flash('Fix the highlighted fields'); window.scrollTo({ top: 0, behavior: 'smooth' }); return } saveDrive(build('published')); flash('Drive published'); nav('/admin/drives') }
  const Sec = ({ t, children }: any) => <section className="card p-6"><h2 className="mb-4 text-lg font-bold">{t}</h2><div className="grid gap-4 sm:grid-cols-2">{children}</div></section>
  const pv = build(f.status); const pc = company(pv.companyId)
  return (
    <>
      <PageHead title={ex ? 'Edit drive' : 'New drive'} sub="Save a draft any time. Publishing notifies every eligible student." action={<div className="flex gap-2"><button className="btn btn-ghost" onClick={() => setPrev(true)}><Eye size={16} />Preview</button><button className="btn btn-ghost" onClick={draft}>Save draft</button><button className="btn btn-primary" onClick={publish}><Globe size={16} />Publish</button></div>} />
      <div className="space-y-5">
        <Sec t="Company"><Field label="Company" error={e.companyId}><select className="input" value={f.companyId} onChange={set('companyId')}>{db.companies.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field><div className="flex items-end"><button className="btn btn-ghost" onClick={() => setNc({ name: '', industry: '' })}><Plus size={16} />Create new company</button></div></Sec>
        <Sec t="Role"><Field label="Job role" error={e.title}><input className="input" value={f.title} onChange={set('title')} /></Field><Field label="Job type"><select className="input" value={f.type} onChange={set('type')}>{JOB_TYPES.map(t => <option key={t}>{t}</option>)}</select></Field>
          <div className="sm:col-span-2"><Field label="Job description" error={e.jd}><textarea rows={4} className="input" value={f.jd} onChange={set('jd')} /></Field></div>
          <Field label="Responsibilities" error={e.resp} hint="One per line"><textarea rows={4} className="input" value={f.resp} onChange={set('resp')} /></Field><Field label="Required skills" error={e.skills} hint="Comma separated"><textarea rows={4} className="input" value={f.skills} onChange={set('skills')} /></Field></Sec>
        <Sec t="Compensation and location"><Field label="Package (LPA)" error={e.lpa}><input inputMode="decimal" className="input" value={f.lpa} onChange={set('lpa')} /></Field><Field label="Monthly stipend (₹)"><input inputMode="numeric" className="input" value={f.stipend} onChange={set('stipend')} /></Field><Field label="Work location" error={e.location}><input className="input" value={f.location} onChange={set('location')} /></Field><Field label="Work mode"><select className="input" value={f.mode} onChange={set('mode')}>{['On-site', 'Hybrid', 'Remote'].map(t => <option key={t}>{t}</option>)}</select></Field><Field label="Openings"><input type="number" min={1} className="input" value={f.openings} onChange={set('openings')} /></Field></Sec>
        <Sec t="Eligibility"><fieldset className="sm:col-span-2"><legend className="label">Branches</legend><div className="flex flex-wrap gap-2">{BRANCHES.map(b => <label key={b} className={`cursor-pointer rounded-full border px-4 py-1.5 text-sm font-semibold ${f.branches.includes(b) ? 'border-ink bg-ink text-white' : 'border-slate-300'}`}><input type="checkbox" className="sr-only" checked={f.branches.includes(b)} onChange={() => tog('branches', b)} />{b}</label>)}</div>{e.branches && <p role="alert" className="mt-1 text-xs font-medium text-red-600">{e.branches}</p>}</fieldset>
          <fieldset><legend className="label">Graduation years</legend><div className="flex gap-2">{[2026, 2027, 2028].map(y => <label key={y} className={`cursor-pointer rounded-full border px-4 py-1.5 text-sm font-semibold ${f.years.includes(y) ? 'border-ink bg-ink text-white' : 'border-slate-300'}`}><input type="checkbox" className="sr-only" checked={f.years.includes(y)} onChange={() => tog('years', y)} />{y}</label>)}</div></fieldset><div />
          <Field label="Minimum CGPA" error={e.minCgpa}><input inputMode="decimal" className="input" value={f.minCgpa} onChange={set('minCgpa')} /></Field><Field label="Maximum active backlogs"><input type="number" min={0} className="input" value={f.maxBacklogs} onChange={set('maxBacklogs')} /></Field></Sec>
        <Sec t="Selection rounds and documents"><Field label="Selection rounds" error={e.rounds} hint="One per line, in order"><textarea rows={4} className="input" value={f.rounds} onChange={set('rounds')} /></Field><fieldset><legend className="label">Required documents</legend>{DOCS.map(d => <label key={d} className="flex items-center gap-2 py-1 text-sm"><input type="checkbox" checked={f.docs.includes(d)} onChange={() => tog('docs', d)} />{d}</label>)}</fieldset></Sec>
        <Sec t="Schedule"><Field label="Applications open (IST)"><input type="datetime-local" className="input" value={f.opensAt} onChange={set('opensAt')} /></Field><Field label="Application deadline (IST)" error={e.deadline}><input type="datetime-local" className="input" value={f.deadline} onChange={set('deadline')} /></Field></Sec>
      </div>
      <Modal open={prev} onClose={() => setPrev(false)} title="Student preview" wide><div className="flex items-center gap-3"><Mono c={pc} size={52} /><div><p className="text-sm text-slate-500">{pc?.name}</p><h3 className="text-2xl font-bold">{pv.title || 'Untitled role'}</h3></div></div>
        <div className="mt-4 flex flex-wrap gap-2"><span className="chip">{pv.lpa ? `₹${pv.lpa} LPA` : pv.stipend ? `₹${pv.stipend / 1000}k / month` : 'Compensation not set'}</span><span className="chip">{pv.location || 'Location not set'}</span><span className="chip">{pv.type}</span></div>
        <p className="mt-4 text-sm text-slate-600">{pv.jd || 'No description yet.'}</p><p className="mt-4 text-sm"><b className="text-ink">Eligible:</b> {pv.branches.join(', ') || 'no branches selected'} · CGPA {pv.minCgpa}+ · max {pv.maxBacklogs} backlogs</p><p className="mt-1 text-sm"><b className="text-ink">Rounds:</b> {pv.rounds.join(' → ')}</p><p className="mt-1 text-sm"><b className="text-ink">Deadline:</b> {pv.deadline ? fmtDT(pv.deadline) : 'Not set'}</p></Modal>
      <Modal open={!!nc} onClose={() => setNc(null)} title="Create company">{nc && <div className="space-y-4"><Field label="Company name"><input className="input" value={nc.name} onChange={e => setNc({ ...nc, name: e.target.value })} /></Field><Field label="Industry"><input className="input" value={nc.industry} onChange={e => setNc({ ...nc, industry: e.target.value })} /></Field><div className="flex justify-end gap-2"><button className="btn btn-ghost" onClick={() => setNc(null)}>Cancel</button><button className="btn btn-primary" disabled={!nc.name.trim()} onClick={() => { const cid = saveCompany({ ...nc, hq: '', website: '', description: '' }); setF({ ...f, companyId: cid }); setNc(null); flash('Company created') }}>Create and select</button></div></div>}</Modal>
    </>
  )
}
