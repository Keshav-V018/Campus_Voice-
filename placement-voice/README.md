# Placement Voice — frontend prototype

React + TypeScript + Vite + Tailwind. All data is dummy data held in the browser (`localStorage`), so every flow works with no backend.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build
```

## Demo logins
- Student: `aarav@student.edu` / `student123`
- Admin: `placement@college.edu` / `admin123`

## Where things live
- `src/data.ts` seed data, eligibility rules, IST date helpers
- `src/store.tsx` the whole "backend": auth, apply rules, statuses, notifications, audit-ready actions
- `src/pages/` public, student and admin screens

## Moving to Supabase later
Each action in `store.tsx` (login, apply, setStatus, saveDrive…) maps to one Supabase call or RPC. Replace those bodies and keep the pages unchanged. Enforce the same rules (window, eligibility, unique student+drive) with RLS and constraints.
