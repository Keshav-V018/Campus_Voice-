import { useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import { useApp } from '../store'
import { BRANCHES, STATUSES, fmtDate, fmtDT } from '../data'
import { Badge, PageHead, Empty, Field, Modal, Pager, csv, Confirm } from '../ui'

export function AdminApps() {
  const { db, setStatus, flash } = useApp(); const [f, setF] = useState<any>({ q: '', drive: '', status: '', branch: '' }); const [page, setPage] = useState(1); const [sel, setSel] = useState<any>(null); const [note, setNote] = useState(''); const [st, setSt] = useState('')
  const rows = useMemo(() => db.apps.map((a: any) => ({ a, s: db.users.find((u: any) => u.id === a.studentId), d: db.drives.find((d: any) => d.id === a.driveId) })).map((r: any) => ({ ...r, c: db.companies.find((c: any) => c.id === r.d?.companyId) }))
    .filter((r: any) => (!f.q || (r.s?.name + r.s?.usn).toLowerCase().includes(f.q.toLowerCase())) && (!f.drive || r.d.id === f.drive) && (!f.status || r.a.status === f.status) && (!f.branch || r.s?.branch === f.branch)).sort((x: any, y: any) => +new Date(y.a.appliedAt) - +new Date(x.a.appliedAt)), [db, f])
  const per = 8; const pages = Math.ceil(rows.length / per) || 1; const cur = Math.min(page, pages); const set = (k: string) => (e: any) => { setF({ ...f, [k]: e.target.value }); setPage(1) }
  const open = (r: any) => { setSel(r); setNote(r.a.notes); setSt(r.a.status) }; const live = sel && db.apps.find((a: any) => a.id === sel.a.id)
  const exp = () => { csv('applicants.csv', [['Reference', 'Name', 'USN', 'Email', 'Branch', 'CGPA', 'Backlogs', 'Company', 'Role', 'Status', 'Applied on'], ...rows.map((r: any) => [r.a.ref, r.s?.name, r.s?.usn, r.s?.email, r.s?.branch, r.s?.cgpa, r.s?.backlogs, r.c?.name, r.d?.title, r.a.status, fmtDate(r.a.appliedAt)])]); flash(`Exported ${rows.length} applicants`) }
  return (
    <>
      <PageHead title="Applications" sub={`${rows.length} matching applications`} action={<button className="btn btn-ghost" onClick={exp} disabled={!rows.length}><Download size={16} />Export CSV</button>} />
      <div className="card mb-5 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <input aria-label="Search student" className="input" placeholder="Search name or USN" value={f.q} onChange={set('q')} />
        <select aria-label="Drive" className="input" value={f.drive} onChange={set('drive')}><option value="">All drives</option>{db.drives.filter((d: any) => d.status !== 'draft').map((d: any) => <option key={d.id} value={d.id}>{d.title}</option>)}</select>
        <select aria-label="Status" className="input" value={f.status} onChange={set('status')}><option value="">All statuses</option>{STATUSES.map(s => <option key={s}>{s}</option>)}</select>
        <select aria-label="Branch" className="input" value={f.branch} onChange={set('branch')}><option value="">All branches</option>{BRANCHES.map(s => <option key={s}>{s}</option>)}</select></div>
      {rows.length ? <div className="card overflow-x-auto"><table className="w-full min-w-[820px]"><thead className="border-b border-slate-100"><tr><th className="th">Student</th><th className="th">Drive</th><th className="th">CGPA</th><th className="th">Applied</th><th className="th">Status</th><th className="th" /></tr></thead><tbody>
        {rows.slice((cur - 1) * per, cur * per).map((r: any) => <tr key={r.a.id} className="border-b border-slate-50 last:border-0"><td className="td"><b className="block text-ink">{r.s?.name}</b><span className="text-xs text-slate-500">{r.s?.usn} · {r.s?.branch}</span></td><td className="td">{r.d?.title}<br /><span className="text-xs text-slate-500">{r.c?.name}</span></td><td className="td">{r.s?.cgpa}</td><td className="td">{fmtDate(r.a.appliedAt)}</td><td className="td"><Badge s={r.a.status} /></td><td className="td"><button className="btn btn-ghost btn-sm" onClick={() => open(r)}>Review</button></td></tr>)}</tbody></table><Pager page={cur} pages={pages} set={setPage} /></div>
        : <Empty title="No applications match" hint="Adjust the filters to see more." />}
      <Modal open={!!sel} onClose={() => setSel(null)} title="Review application" wide>{sel && live && <div className="space-y-4 text-sm">
        <div className="grid gap-3 rounded-2xl bg-brand-50 p-4 sm:grid-cols-2"><p><b className="text-ink">{sel.s?.name}</b><br />{sel.s?.usn} · {sel.s?.branch} · CGPA {sel.s?.cgpa} · {sel.s?.backlogs} backlogs</p><p><b className="text-ink">{sel.d?.title}</b><br />{sel.c?.name} · Ref {live.ref}</p><p className="sm:col-span-2">Resume: {sel.s?.resume || 'Not uploaded'}</p></div>
        <div><p className="label">Student's answer</p><p className="rounded-xl border border-slate-200 p-3 text-slate-600">{live.answers}</p></div>
        <Field label="Status"><select className="input" value={st} onChange={e => setSt(e.target.value)}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></Field>
        <Field label="Private notes" hint="Never shown to students"><textarea rows={3} className="input" value={note} onChange={e => setNote(e.target.value)} /></Field>
        <details><summary className="cursor-pointer font-semibold text-brand-600">Status history</summary><ul className="mt-2 space-y-1 border-l-2 border-brand-100 pl-4">{[...live.history].reverse().map((h: any, i: number) => <li key={i}>{h.status} <span className="text-slate-500">· {fmtDT(h.at)}</span></li>)}</ul></details>
        <div className="flex justify-end gap-2"><button className="btn btn-ghost" onClick={() => setSel(null)}>Close</button><button className="btn btn-primary" onClick={() => { setStatus(live.id, st, note); flash(st !== live.status ? `Status set to ${st}. Student notified` : 'Notes saved'); setSel(null) }}>Save changes</button></div></div>}</Modal>
    </>
  )
}

export function AdminStudents() {
  const { db } = useApp(); const [q, setQ] = useState(''); const [b, setB] = useState(''); const [page, setPage] = useState(1)
  const list = db.users.filter((u: any) => u.role === 'student' && (!b || u.branch === b) && (u.name + u.usn).toLowerCase().includes(q.toLowerCase())); const per = 8; const pages = Math.ceil(list.length / per) || 1; const cur = Math.min(page, pages)
  return (
    <>
      <PageHead title="Students" sub={`${list.length} registered students`} />
      <div className="mb-5 flex flex-wrap gap-3"><input aria-label="Search students" className="input max-w-xs" placeholder="Search name or USN" value={q} onChange={e => { setQ(e.target.value); setPage(1) }} /><select aria-label="Branch" className="input max-w-[160px]" value={b} onChange={e => { setB(e.target.value); setPage(1) }}><option value="">All branches</option>{BRANCHES.map(x => <option key={x}>{x}</option>)}</select></div>
      {list.length ? <div className="card overflow-x-auto"><table className="w-full min-w-[720px]"><thead className="border-b border-slate-100"><tr><th className="th">Student</th><th className="th">Branch</th><th className="th">Year</th><th className="th">CGPA</th><th className="th">Backlogs</th><th className="th">Resume</th><th className="th">Applications</th></tr></thead><tbody>
        {list.slice((cur - 1) * per, cur * per).map((u: any) => <tr key={u.id} className="border-b border-slate-50 last:border-0"><td className="td"><b className="block text-ink">{u.name}</b><span className="text-xs text-slate-500">{u.usn}</span></td><td className="td">{u.branch}</td><td className="td">{u.year}</td><td className="td">{u.cgpa}</td><td className="td">{u.backlogs}</td><td className="td">{u.resume ? <span className="chip">Uploaded</span> : <span className="text-xs text-amber-600">Missing</span>}</td><td className="td">{db.apps.filter((a: any) => a.studentId === u.id).length}</td></tr>)}</tbody></table><Pager page={cur} pages={pages} set={setPage} /></div> : <Empty title="No students found" />}
    </>
  )
}

export function AdminAnnouncements() {
  const { db, announce, flash } = useApp(); const blank = { title: '', content: '', driveId: '', kind: 'Recruitment update' }; const [f, setF] = useState(blank); const [e, setE] = useState<any>({})
  const set = (k: string) => (ev: any) => setF({ ...f, [k]: ev.target.value })
  const send = () => { const x: any = {}; if (f.title.trim().length < 4) x.title = 'Add a title.'; if (f.content.trim().length < 10) x.content = 'Write the announcement (10+ characters).'; setE(x); if (Object.keys(x).length) return
    announce(f); const n = f.driveId ? db.apps.filter((a: any) => a.driveId === f.driveId).length : db.users.filter((u: any) => u.role === 'student').length; flash(`Published to ${n} students`); setF(blank) }
  return (
    <>
      <PageHead title="Announcements" sub="Choose a drive to notify only its applicants, or leave it open to notify every student." />
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="card space-y-4 p-6"><h2 className="text-lg font-bold">New announcement</h2>
          <Field label="Type"><select className="input" value={f.kind} onChange={set('kind')}>{['Recruitment update', 'Test schedule', 'Interview schedule', 'Venue', 'Drive message'].map(k => <option key={k}>{k}</option>)}</select></Field>
          <Field label="Related drive"><select className="input" value={f.driveId} onChange={set('driveId')}><option value="">All students</option>{db.drives.filter((d: any) => d.status === 'published').map((d: any) => <option key={d.id} value={d.id}>{d.title}</option>)}</select></Field>
          <Field label="Title" error={e.title}><input className="input" value={f.title} onChange={set('title')} /></Field><Field label="Message" error={e.content}><textarea rows={4} className="input" value={f.content} onChange={set('content')} /></Field>
          <button className="btn btn-primary w-full" onClick={send}>Publish announcement</button></div>
        <div className="space-y-3">{db.anns.map((a: any) => <div key={a.id} className="card p-5"><div className="flex items-center justify-between"><span className="chip">{a.kind}</span><span className="text-xs text-slate-400">{fmtDT(a.at)}</span></div><p className="mt-2 font-bold text-ink">{a.title}</p><p className="text-sm text-slate-600">{a.content}</p>{a.driveId && <p className="mt-2 text-xs text-slate-500">Drive: {db.drives.find((d: any) => d.id === a.driveId)?.title}</p>}</div>)}</div>
      </div>
    </>
  )
}

const Bars = ({ title, data }: { title: string; data: [string, number][] }) => { const m = Math.max(1, ...data.map(d => d[1])); return (
  <section className="card p-5"><h2 className="mb-4 text-lg font-bold">{title}</h2>{data.length ? <div className="space-y-3">{data.map(([l, n]) => <div key={l}><div className="mb-1 flex justify-between text-sm"><span className="text-ink">{l}</span><b className="text-ink">{n}</b></div><div className="h-2.5 rounded-full bg-brand-50"><div className="h-2.5 rounded-full bg-ink" style={{ width: `${(n / m) * 100}%` }} /></div></div>)}</div> : <p className="text-sm text-slate-500">No data for these filters.</p>}</section>) }
export function AdminReports() {
  const { db, flash } = useApp(); const [co, setCo] = useState(''); const [days, setDays] = useState('')
  const rows = db.apps.map((a: any) => { const d = db.drives.find((x: any) => x.id === a.driveId); return { a, d, c: db.companies.find((c: any) => c.id === d?.companyId), s: db.users.find((u: any) => u.id === a.studentId) } })
    .filter((r: any) => (!co || r.c?.id === co) && (!days || Date.now() - +new Date(r.a.appliedAt) <= +days * 864e5))
  const tally = (key: (r: any) => string) => Object.entries(rows.reduce((m: any, r: any) => { const k = key(r); m[k] = (m[k] || 0) + 1; return m }, {})).sort((a: any, b: any) => b[1] - a[1]) as [string, number][]
  const sl = rows.filter((r: any) => ['Shortlisted', 'Assessment Scheduled', 'Interview Scheduled', 'Selected'].includes(r.a.status)).length; const sel = rows.filter((r: any) => r.a.status === 'Selected').length
  const exp = () => { csv('report.csv', [['Company', 'Role', 'Branch', 'Status', 'Applied on'], ...rows.map((r: any) => [r.c?.name, r.d?.title, r.s?.branch, r.a.status, fmtDate(r.a.appliedAt)])]); flash('Report exported') }
  return (
    <>
      <PageHead title="Reports" sub="Recruitment analytics for the current season." action={<button className="btn btn-ghost" onClick={exp}><Download size={16} />Export CSV</button>} />
      <div className="mb-5 flex flex-wrap gap-3"><select aria-label="Company" className="input max-w-[220px]" value={co} onChange={e => setCo(e.target.value)}><option value="">All companies</option>{db.companies.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select><select aria-label="Date range" className="input max-w-[200px]" value={days} onChange={e => setDays(e.target.value)}><option value="">All time</option><option value="7">Last 7 days</option><option value="30">Last 30 days</option></select></div>
      <div className="mb-6 grid grid-cols-3 gap-4">{[['Applications', rows.length], ['Shortlisted or beyond', sl], ['Selected', sel]].map(([l, n]: any) => <div key={l} className="card p-5"><p className="font-display text-4xl font-extrabold text-ink">{n}</p><p className="text-sm text-slate-500">{l}</p></div>)}</div>
      <div className="grid gap-5 lg:grid-cols-2"><Bars title="Applications by company" data={tally(r => r.c?.name)} /><Bars title="Branch-wise participation" data={tally(r => r.s?.branch)} /><Bars title="Most popular drives" data={tally(r => r.d?.title).slice(0, 6)} /><Bars title="Pipeline by status" data={tally(r => r.a.status)} /></div>
    </>
  )
}

export function AdminSettings() {
  const { me, reset } = useApp(); const [c, setC] = useState(false)
  return (
    <>
      <PageHead title="Settings" />
      <div className="grid gap-5 lg:grid-cols-2"><div className="card p-6"><h2 className="text-lg font-bold">Your account</h2><p className="mt-3 text-sm">{me.name}<br /><span className="text-slate-500">{me.email}</span></p><p className="mt-3 text-xs text-slate-500">Admin accounts are provisioned by the college administrator, never through public registration. All times are shown in Asia/Kolkata (IST).</p></div>
        <div className="card p-6"><h2 className="text-lg font-bold">Sample data</h2><p className="mt-2 text-sm text-slate-600">Everything in this prototype lives in your browser. Restore the original records at any time.</p><button className="btn btn-danger mt-4" onClick={() => setC(true)}>Restore demo data</button></div></div>
      <Confirm open={c} onClose={() => setC(false)} danger label="Restore demo data" title="Restore demo data?" text="All changes you made in this browser will be lost and you will be logged out." onYes={reset} />
    </>
  )
}
