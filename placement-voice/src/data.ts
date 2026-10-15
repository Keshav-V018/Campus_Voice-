export const BRANCHES = ['CSE', 'ISE', 'AIML', 'ECE', 'EEE', 'ME', 'CV']
export const STATUSES = ['Applied', 'Under Review', 'Shortlisted', 'Assessment Scheduled', 'Interview Scheduled', 'Selected', 'Rejected', 'Withdrawn']
export const JOB_TYPES = ['Full-time', 'Internship', 'Intern + FTE']
export const DOCS = ['Resume', 'College ID card', 'Latest marksheet', 'Offer letter of other companies']

const day = (n: number) => new Date(Date.now() + n * 864e5).toISOString()
let seed = 7
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647

export const fmtDate = (iso: string) => new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso))
export const fmtDT = (iso: string) => new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(iso)) + ' IST'
export const daysLeft = (iso: string) => Math.ceil((new Date(iso).getTime() - Date.now()) / 864e5)
export const toInput = (iso: string) => { const d = new Date(new Date(iso).getTime() + 5.5 * 3600e3); return d.toISOString().slice(0, 16) }
export const fromInput = (s: string) => new Date(new Date(s + ':00Z').getTime() - 5.5 * 3600e3).toISOString()
export const uid = (p = '') => p + Math.random().toString(36).slice(2, 9)

export const companies = [
  { id: 'c1', name: 'Northwind Labs', industry: 'Product Engineering', hq: 'Bengaluru', website: 'https://example.com', color: '#2A52D4', description: 'Builds developer tooling and cloud-native platforms used by growing engineering teams.' },
  { id: 'c2', name: 'Kaveri Systems', industry: 'IT Services', hq: 'Mysuru', website: 'https://example.com', color: '#0E7C66', description: 'Enterprise software and digital transformation services for banks and public utilities.' },
  { id: 'c3', name: 'Orbit Pay', industry: 'Fintech', hq: 'Bengaluru', website: 'https://example.com', color: '#7C3AED', description: 'Payments infrastructure for online merchants, processing millions of transactions a day.' },
  { id: 'c4', name: 'Lumen Analytics', industry: 'Data & AI', hq: 'Hyderabad', website: 'https://example.com', color: '#D9480F', description: 'Decision-intelligence products that turn messy operational data into dashboards teams trust.' },
  { id: 'c5', name: 'Tessera Cloud', industry: 'Cloud', hq: 'Pune', website: 'https://example.com', color: '#0B7285', description: 'Managed Kubernetes and observability for mid-size SaaS companies.' },
  { id: 'c6', name: 'Vayu Robotics', industry: 'Robotics & Embedded', hq: 'Chennai', website: 'https://example.com', color: '#B45309', description: 'Autonomous warehouse robots and the embedded systems that run them.' },
  { id: 'c7', name: 'Mango Mobility', industry: 'EV & Hardware', hq: 'Bengaluru', website: 'https://example.com', color: '#C2255C', description: 'Electric two-wheelers, battery packs and charging hardware designed in India.' },
  { id: 'c8', name: 'BlueHarbor Infra', industry: 'Core Engineering', hq: 'Mangaluru', website: 'https://example.com', color: '#1864AB', description: 'Design and construction of coastal infrastructure, bridges and smart-city projects.' }
]

const mk = (id: string, companyId: string, title: string, o: any) => ({
  id, companyId, title, jd: o.jd, responsibilities: o.resp, skills: o.skills, branches: o.br, years: o.yrs || [2027], minCgpa: o.cg, maxBacklogs: o.bk ?? 0,
  lpa: o.lpa, stipend: o.st || 0, type: o.type || 'Full-time', location: o.loc, mode: o.mode || 'On-site', openings: o.n || 10,
  opensAt: day(o.open ?? -5), deadline: day(o.dl), rounds: o.rounds || ['Online assessment', 'Technical interview', 'HR interview'],
  docs: ['Resume', 'College ID card'], status: o.status || 'published', updatedAt: day(o.up ?? -1)
})
const CS = ['CSE', 'ISE', 'AIML']
export const drives: any[] = [
  mk('d1', 'c1', 'Software Engineer', { jd: 'Join the platform team building the APIs and services behind our developer products. You will ship to production within your first month.', resp: ['Build and review backend services', 'Write tests and maintain CI pipelines', 'Pair with senior engineers on design reviews'], skills: ['Java or Go', 'Data structures', 'SQL', 'REST APIs'], br: CS, cg: 7.5, lpa: 14, loc: 'Bengaluru', mode: 'Hybrid', n: 12, dl: 9, up: 0 }),
  mk('d2', 'c2', 'Associate Systems Engineer', { jd: 'Work on large enterprise implementations with a structured 12-week onboarding programme.', resp: ['Develop modules for client applications', 'Debug and resolve production tickets', 'Document solutions for the delivery team'], skills: ['Java', 'SQL', 'Communication'], br: [...CS, 'ECE', 'EEE'], cg: 6, bk: 1, lpa: 4.5, loc: 'Mysuru', n: 60, dl: 14, rounds: ['Aptitude test', 'Technical interview', 'HR interview'] }),
  mk('d3', 'c3', 'Backend Intern', { jd: 'A six-month internship on the payments core team with a pre-placement offer for strong performers.', resp: ['Implement payment-flow features', 'Build internal admin tools', 'Contribute to reliability reviews'], skills: ['Python or Java', 'Databases', 'Problem solving'], br: CS, cg: 8, lpa: 10, st: 40000, type: 'Intern + FTE', loc: 'Bengaluru', mode: 'Hybrid', n: 6, dl: 5, up: 0, rounds: ['Coding round', 'System design discussion', 'Managerial round'] }),
  mk('d4', 'c4', 'Data Analyst', { jd: 'Turn operational data into insight for logistics and retail clients.', resp: ['Clean and model datasets', 'Build dashboards in Power BI', 'Present findings to clients'], skills: ['SQL', 'Python', 'Statistics', 'Power BI'], br: ['CSE', 'AIML', 'ISE', 'ECE'], cg: 7, lpa: 7.5, loc: 'Hyderabad', mode: 'Remote', n: 8, dl: 20 }),
  mk('d5', 'c5', 'Cloud Support Engineer', { jd: 'Be the first responder for customers running production workloads on Kubernetes.', resp: ['Triage and resolve support cases', 'Write runbooks and knowledge-base articles', 'Escalate engineering bugs with clear repros'], skills: ['Linux', 'Networking basics', 'Docker'], br: [...CS, 'ECE'], cg: 6.5, lpa: 6, loc: 'Pune', mode: 'Hybrid', n: 15, dl: 26 }),
  mk('d6', 'c6', 'Embedded Firmware Engineer', { jd: 'Write firmware for motor controllers and sensor stacks in autonomous robots.', resp: ['Develop C/C++ firmware', 'Bring up new boards with the hardware team', 'Test on real robots in the warehouse lab'], skills: ['C/C++', 'RTOS', 'Microcontrollers'], br: ['ECE', 'EEE', 'CSE'], cg: 7, lpa: 8.2, loc: 'Chennai', n: 7, dl: 12 }),
  mk('d7', 'c7', 'Graduate Engineer Trainee – Powertrain', { jd: 'A rotational programme across battery, motor and controls teams.', resp: ['Assist in battery pack testing', 'Prepare design documentation', 'Support validation runs'], skills: ['CAD', 'Thermodynamics', 'MATLAB'], br: ['ME', 'EEE'], cg: 6.5, lpa: 5.5, loc: 'Bengaluru', n: 10, dl: 17 }),
  mk('d8', 'c8', 'Site Engineer', { jd: 'Supervise civil works for coastal and bridge projects with mentoring from senior engineers.', resp: ['Monitor on-site progress and quality', 'Prepare daily progress reports', 'Coordinate with contractors'], skills: ['AutoCAD', 'Surveying', 'Estimation'], br: ['CV'], cg: 6, bk: 2, lpa: 4.2, loc: 'Mangaluru', n: 12, dl: 22 }),
  mk('d9', 'c1', 'Frontend Engineer Intern', { jd: 'Build polished interfaces for our developer dashboard.', resp: ['Implement UI from design specs', 'Write component tests', 'Improve accessibility'], skills: ['React', 'TypeScript', 'CSS'], br: CS, cg: 7, lpa: 0, st: 35000, type: 'Internship', loc: 'Bengaluru', mode: 'Remote', n: 5, dl: -3, status: 'closed', up: -3 }),
  mk('d10', 'c4', 'ML Engineer (draft)', { jd: 'Deploy forecasting models to production.', resp: ['Train and evaluate models', 'Build inference services'], skills: ['Python', 'PyTorch'], br: ['AIML', 'CSE'], cg: 8, lpa: 12, loc: 'Hyderabad', n: 4, dl: 30, open: 3, status: 'draft', up: -2 })
]

const names = ['Aarav Sharma', 'Diya Nair', 'Rohan Gowda', 'Ishita Rao', 'Karthik Menon', 'Meera Iyer', 'Vikram Patil', 'Ananya Hegde', 'Sanjay Kulkarni', 'Neha Bhat', 'Arjun Reddy', 'Pooja Shetty', 'Harsh Jain', 'Lakshmi Prasad', 'Tanvi Desai']
export const users: any[] = [
  { id: 'a1', name: 'Placement Office', email: 'placement@college.edu', password: 'admin123', role: 'admin', createdAt: day(-200) },
  ...names.map((n, i) => ({ id: 's' + (i + 1), name: n, email: i === 0 ? 'aarav@student.edu' : n.split(' ')[0].toLowerCase() + '@student.edu', password: 'student123', role: 'student', usn: `1XX22${BRANCHES[i % 7].slice(0, 2)}${String(i + 1).padStart(3, '0')}`, branch: BRANCHES[i % 7], year: 2027, cgpa: i === 0 ? 8.2 : +(6 + rnd() * 3.4).toFixed(1), backlogs: i % 6 === 5 ? 1 : 0, phone: '', resume: i % 4 === 3 ? '' : n.split(' ')[0] + '_Resume.pdf', createdAt: day(-90 + i) }))
]
export const criteria = (u: any, d: any) => [
  { label: `Branch: ${d.branches.join(', ')}`, ok: d.branches.includes(u.branch) },
  { label: `Graduation year: ${d.years.join(', ')}`, ok: d.years.includes(Number(u.year)) },
  { label: `CGPA of ${d.minCgpa} or above`, ok: Number(u.cgpa) >= d.minCgpa },
  { label: `At most ${d.maxBacklogs} active backlog${d.maxBacklogs === 1 ? '' : 's'}`, ok: Number(u.backlogs) <= d.maxBacklogs }
]
export const isEligible = (u: any, d: any) => !!u && criteria(u, d).every(c => c.ok)

export const apps: any[] = []
const pub = drives.filter(d => d.status !== 'draft')
users.filter(u => u.role === 'student').forEach((u, i) => {
  pub.forEach((d, j) => {
    if (i === 0 && j > 2) return
    if (!isEligible(u, d) || (i > 0 && rnd() > 0.55)) return
    const path = ['Applied', 'Under Review', 'Shortlisted', 'Assessment Scheduled', 'Interview Scheduled', 'Selected', 'Rejected']
    const k = i === 0 ? [1, 2, 0][j] : Math.floor(rnd() * path.length)
    const hist = path.slice(0, Math.min(k, 4) + 1).map((s, x) => ({ status: s, at: day(-9 + x * 1.5 + j) }))
    if (k === 5) hist.push({ status: 'Selected', at: day(-1) }); if (k === 6) hist.push({ status: 'Rejected', at: day(-1) })
    apps.push({ id: uid('a'), ref: `PV-26-${String(1000 + apps.length * 7)}`, driveId: d.id, studentId: u.id, status: hist[hist.length - 1].status, appliedAt: hist[0].at, history: hist, notes: '', answers: 'Interested in the role and the team.' })
  })
})

export const notes: any[] = [
  { id: 'n1', userId: 's1', title: 'Welcome to Placement Voice', message: 'Complete your profile and upload your resume to start applying.', read: false, at: day(-6) },
  { id: 'n2', userId: 's1', title: 'New drive: Software Engineer at Northwind Labs', message: 'Applications close soon. You are eligible to apply.', driveId: 'd1', read: false, at: day(-2) },
  { id: 'n3', userId: 'a1', title: 'Placement season is open', message: 'Publish drives and announcements to notify students.', read: true, at: day(-6) }
]
export const anns: any[] = [
  { id: 'an1', title: 'Online assessment for Orbit Pay', content: 'The coding round runs in Lab 3 on the date shown on your application. Carry your college ID. Reporting time is 9:30 AM.', driveId: 'd3', kind: 'Test schedule', at: day(-1) },
  { id: 'an2', title: 'Pre-placement talk: Northwind Labs', content: 'Seminar Hall B, 4:00 PM. Attendance is recommended for all CSE, ISE and AIML students.', driveId: 'd1', kind: 'Venue', at: day(-2) }
]
