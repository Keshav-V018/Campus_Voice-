import { useState } from 'react'
import { Routes, Route, Navigate, NavLink, Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Bell, LayoutDashboard, Building2, Briefcase, FileText, Users, Megaphone, BarChart3, Settings, Menu, LogOut, X } from 'lucide-react'
import { useApp } from './store'
import { Logo, Toast } from './ui'
import { Landing, Login, Register } from './pages/public'
import { StudentDash, Drives, DriveDetail, MyApps, Notifications, Profile } from './pages/student'
import { AdminDash, AdminCompanies, AdminDrives, DriveForm } from './pages/admin1'
import { AdminApps, AdminStudents, AdminAnnouncements, AdminReports, AdminSettings } from './pages/admin2'

function Guard({ role }: { role?: 'admin' | 'student' }) {
  const { me } = useApp(); const loc = useLocation()
  if (!me) return <Navigate to="/login" state={{ from: loc.pathname }} replace />
  if (role && me.role !== role) return <Navigate to={me.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />
  return <Outlet />
}
const nl = ({ isActive }: any) => `rounded-full px-4 py-2 text-sm font-semibold transition ${isActive ? 'bg-ink text-white' : 'text-slate-600 hover:bg-brand-50 hover:text-ink'}`

export function PublicShell() {
  const { me } = useApp()
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" aria-label="Placement Voice home"><Logo /></Link>
          <nav className="hidden items-center gap-1 md:flex"><a className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-brand-50" href="/#drives">Drives</a><a className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-brand-50" href="/#how">How it works</a><a className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-brand-50" href="/#faq">Help</a></nav>
          <div className="flex items-center gap-2">
            {me ? <Link className="btn btn-primary btn-sm" to={me.role === 'admin' ? '/admin/dashboard' : '/dashboard'}>Open dashboard</Link> : <><Link className="btn btn-ghost btn-sm" to="/login">Log in</Link><Link className="btn btn-primary btn-sm" to="/register">Register</Link></>}
          </div>
        </div>
      </header>
      <main className="flex-1"><Outlet /></main>
      <footer className="bg-ink text-slate-300"><div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div><Logo light /><p className="mt-4 max-w-xs text-sm text-slate-400">One portal for the training and placement cell and every student looking for their first offer.</p></div>
        <div className="text-sm"><h4 className="mb-3 font-semibold text-white">Placement cell</h4><p>placement@college.edu</p><p>+91 80 0000 0000</p><p>Training &amp; Placement Block, Ground Floor</p></div>
        <div className="text-sm"><h4 className="mb-3 font-semibold text-white">Help</h4><ul className="space-y-1.5"><li><a href="/#faq" className="hover:text-white">Help centre</a></li><li><a href="/#faq" className="hover:text-white">Privacy policy</a></li><li><Link to="/login" className="hover:text-white">Placement office login</Link></li></ul></div>
      </div><div className="border-t border-white/10 py-4 text-center text-xs text-slate-500">Prototype with sample data. Companies and drives shown are illustrative. © 2026 Placement Voice</div></footer>
    </div>
  )
}

export function StudentShell() {
  const { me, db, logout } = useApp(); const nav = useNavigate(); const [open, setOpen] = useState(false)
  const unread = db.notes.filter((n: any) => n.userId === me.id && !n.read).length
  const links = [['/dashboard', 'Dashboard'], ['/drives', 'Drives'], ['/my-applications', 'My applications'], ['/profile', 'Profile']]
  return (
    <div className="min-h-screen bg-brand-50/60">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/dashboard" aria-label="Dashboard"><Logo /></Link>
          <nav className="hidden items-center gap-1 lg:flex">{links.map(([to, l]) => <NavLink key={to} to={to} className={nl}>{l}</NavLink>)}</nav>
          <div className="flex items-center gap-2">
            <Link to="/notifications" aria-label={`Notifications, ${unread} unread`} className="relative rounded-full p-2.5 hover:bg-brand-50"><Bell size={20} />{unread > 0 && <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-bold text-ink">{unread}</span>}</Link>
            <span className="hidden h-9 w-9 items-center justify-center rounded-full bg-ink text-sm font-bold text-white sm:flex" aria-hidden>{me.name[0]}</span>
            <button className="btn btn-ghost btn-sm hidden sm:inline-flex" onClick={() => { logout(); nav('/') }}><LogOut size={14} />Log out</button>
            <button className="rounded-full p-2 lg:hidden" aria-label="Menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
          </div>
        </div>
        {open && <div className="border-t border-slate-100 p-3 lg:hidden">{links.map(([to, l]) => <NavLink key={to} to={to} onClick={() => setOpen(false)} className={nl}>{({ isActive }: any) => <span className="block">{l}</span>}</NavLink>)}<button className="mt-2 w-full rounded-full px-4 py-2 text-left text-sm font-semibold text-red-600" onClick={() => { logout(); nav('/') }}>Log out</button></div>}
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6"><Outlet /></main>
    </div>
  )
}

export function AdminShell() {
  const { me, logout } = useApp(); const nav = useNavigate(); const [open, setOpen] = useState(false)
  const items = [['dashboard', 'Dashboard', LayoutDashboard], ['companies', 'Companies', Building2], ['drives', 'Drives', Briefcase], ['applications', 'Applications', FileText], ['students', 'Students', Users], ['announcements', 'Announcements', Megaphone], ['reports', 'Reports', BarChart3], ['settings', 'Settings', Settings]] as any[]
  const side = (
    <div className="flex h-full flex-col bg-ink p-5 text-slate-300">
      <Link to="/admin/dashboard"><Logo light /></Link>
      <p className="mb-2 mt-8 px-3 text-xs text-slate-500">Placement office</p>
      <nav className="space-y-1">{items.map(([p, l, I]) => <NavLink key={p} to={`/admin/${p}`} onClick={() => setOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-white text-ink' : 'hover:bg-white/10 hover:text-white'}`}><I size={18} />{l}</NavLink>)}</nav>
      <div className="mt-auto rounded-2xl bg-white/10 p-4 text-sm"><p className="font-semibold text-white">{me.name}</p><p className="text-xs text-slate-400">{me.email}</p><button className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-amber-400" onClick={() => { logout(); nav('/') }}><LogOut size={14} />Log out</button></div>
    </div>
  )
  return (
    <div className="min-h-screen bg-brand-50/60 lg:pl-64">
      <aside className="fixed inset-y-0 left-0 hidden w-64 lg:block">{side}</aside>
      {open && <div className="fixed inset-0 z-50 lg:hidden"><div className="absolute inset-0 bg-ink/50" onClick={() => setOpen(false)} /><div className="relative h-full w-72">{side}</div></div>}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden"><button aria-label="Open menu" onClick={() => setOpen(true)}><Menu /></button><Logo size={28} /><span className="w-6" /></div>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6"><Outlet /></main>
    </div>
  )
}

export default function App() {
  return (
    <>
      <Routes>
        <Route element={<PublicShell />}><Route path="/" element={<Landing />} /><Route path="/login" element={<Login />} /><Route path="/register" element={<Register />} /></Route>
        <Route element={<Guard role="student" />}><Route element={<StudentShell />}>
          <Route path="/dashboard" element={<StudentDash />} /><Route path="/drives" element={<Drives />} /><Route path="/drives/:id" element={<DriveDetail />} />
          <Route path="/my-applications" element={<MyApps />} /><Route path="/notifications" element={<Notifications />} /><Route path="/profile" element={<Profile />} />
        </Route></Route>
        <Route element={<Guard role="admin" />}><Route element={<AdminShell />}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} /><Route path="/admin/dashboard" element={<AdminDash />} />
          <Route path="/admin/companies" element={<AdminCompanies />} /><Route path="/admin/drives" element={<AdminDrives />} />
          <Route path="/admin/drives/new" element={<DriveForm />} /><Route path="/admin/drives/:id/edit" element={<DriveForm />} />
          <Route path="/admin/applications" element={<AdminApps />} /><Route path="/admin/students" element={<AdminStudents />} />
          <Route path="/admin/announcements" element={<AdminAnnouncements />} /><Route path="/admin/reports" element={<AdminReports />} /><Route path="/admin/settings" element={<AdminSettings />} />
        </Route></Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toast />
    </>
  )
}
