import { useMemo, useState } from "react";
import {
  Link,
  useParams,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import {
  Search,
  Bookmark,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Upload,
  ArrowLeft,
  Briefcase,
  FileCheck2,
} from "lucide-react";
import { useApp } from "../store";
import {
  BRANCHES,
  JOB_TYPES,
  criteria,
  isEligible,
  daysLeft,
  fmtDate,
  fmtDT,
} from "../data";
import {
  Mono,
  Badge,
  PageHead,
  Empty,
  Field,
  Modal,
  Skeleton,
  useLoading,
  Confirm,
} from "../ui";

const pay = (d: any) =>
  d.lpa ? `₹${d.lpa} LPA` : `₹${d.stipend / 1000}k / month`;
export function DriveCard({ d }: { d: any }) {
  const { company, me, toggleSave, isSaved, flash } = useApp();
  const c = company(d.companyId);
  const ok = isEligible(me, d);
  const dl = daysLeft(d.deadline);
  const saved = isSaved(d.id);
  return (
    <div className="card relative flex flex-col p-5 transition hover:border-brand-400">
      <button
        aria-label={saved ? "Remove bookmark" : "Bookmark drive"}
        aria-pressed={saved}
        onClick={() => {
          toggleSave(d.id);
          flash(saved ? "Bookmark removed" : "Drive bookmarked");
        }}
        className="absolute right-4 top-4 rounded-full p-1.5 hover:bg-brand-50"
      >
        <Bookmark
          size={18}
          className={saved ? "fill-amber-400 text-amber-500" : "text-slate-400"}
        />
      </button>
      <div className="flex items-center gap-3">
        <Mono c={c} />
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink">{c?.name}</p>
          <p className="text-xs text-slate-500">{d.type}</p>
        </div>
      </div>
      <Link
        to={`/drives/${d.id}`}
        className="mt-4 text-lg font-bold text-ink after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-brand-500"
      >
        {d.title}
      </Link>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="chip">{pay(d)}</span>
        <span className="chip">
          <MapPin size={12} />
          {d.location}
        </span>
        <span className="chip">{d.mode}</span>
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
        <span
          className={`flex items-center gap-1.5 ${dl <= 5 && dl >= 0 ? "font-semibold text-amber-600" : "text-slate-500"}`}
        >
          <Clock size={14} />
          {dl < 0 ? "Closed" : `${dl}d left · ${fmtDate(d.deadline)}`}
        </span>
        <span
          className={`flex items-center gap-1 text-xs font-semibold ${ok ? "text-emerald-600" : "text-slate-400"}`}
        >
          {ok ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
          {ok ? "Eligible" : "Not eligible"}
        </span>
      </div>
    </div>
  );
}

export function StudentDash() {
  const { me, db, drive, company } = useApp();
  const open = db.drives.filter(
    (d: any) => d.status === "published" && daysLeft(d.deadline) >= 0,
  );
  const elig = open.filter((d: any) => isEligible(me, d));
  const mine = db.apps.filter((a: any) => a.studentId === me.id);
  const mineIds = mine.map((a: any) => a.driveId);
  const remind = elig.filter(
    (d: any) => daysLeft(d.deadline) <= 7 && !mineIds.includes(d.id),
  );
  const notes = db.notes.filter((n: any) => n.userId === me.id).slice(0, 4);
  const count = (s: string) => mine.filter((a: any) => a.status === s).length;
  return (
    <>
      <div className="mb-8 rounded-3xl bg-ink p-8 text-white">
        <p className="text-sm text-brand-200">
          {new Intl.DateTimeFormat("en-IN", {
            timeZone: "Asia/Kolkata",
            weekday: "long",
            day: "numeric",
            month: "long",
          }).format(new Date())}
        </p>
        <h1 className="mt-1 text-3xl font-extrabold text-white sm:text-4xl">
          Hello, {me.name.split(" ")[0]}
        </h1>
        <p className="mt-2 max-w-xl text-brand-100">
          {remind.length
            ? `${remind.length} eligible drive${remind.length > 1 ? "s close" : " closes"} within a week and you have not applied yet.`
            : `You are eligible for ${elig.length} open drives.`}
        </p>
        {!me.resume && (
          <Link to="/profile" className="btn btn-amber mt-5">
            Upload your resume
          </Link>
        )}
      </div>
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          ["Applied", mine.length],
          ["Shortlisted", count("Shortlisted")],
          [
            "Interviews",
            count("Interview Scheduled") + count("Assessment Scheduled"),
          ],
          ["Selected", count("Selected")],
        ].map(([l, n]: any) => (
          <div key={l} className="card p-5">
            <p className="font-display text-4xl font-extrabold text-ink">{n}</p>
            <p className="text-sm text-slate-500">{l}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Drives you are eligible for</h2>
            <Link to="/drives" className="text-sm font-semibold text-brand-600">
              Browse all
            </Link>
          </div>
          {elig.length ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {elig.slice(0, 4).map((d: any) => (
                <DriveCard key={d.id} d={d} />
              ))}
            </div>
          ) : (
            <Empty
              title="No eligible drives yet"
              hint="Check that your branch, CGPA and backlogs are correct in your profile."
              action={
                <Link to="/profile" className="btn btn-primary">
                  Review profile
                </Link>
              }
            />
          )}
        </section>
        <aside className="space-y-6">
          <div className="card p-5">
            <h2 className="mb-3 text-lg font-bold">Deadline reminders</h2>
            {remind.length ? (
              remind.map((d: any) => (
                <Link
                  key={d.id}
                  to={`/drives/${d.id}`}
                  className="flex items-center justify-between border-t border-slate-100 py-3 text-sm first:border-0"
                >
                  <span>
                    <b className="text-ink">{d.title}</b>
                    <br />
                    <span className="text-slate-500">
                      {company(d.companyId)?.name}
                    </span>
                  </span>
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                    {daysLeft(d.deadline)}d
                  </span>
                </Link>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                Nothing closing this week.
              </p>
            )}
          </div>
          <div className="card p-5">
            <div className="mb-3 flex justify-between">
              <h2 className="text-lg font-bold">Recent notifications</h2>
              <Link
                to="/notifications"
                className="text-sm font-semibold text-brand-600"
              >
                All
              </Link>
            </div>
            {notes.length ? (
              notes.map((n: any) => (
                <div
                  key={n.id}
                  className="border-t border-slate-100 py-3 text-sm first:border-0"
                >
                  <p className={`text-ink ${n.read ? "" : "font-bold"}`}>
                    {n.title}
                  </p>
                  <p className="text-xs text-slate-500">{fmtDT(n.at)}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">You are all caught up.</p>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}

export function Drives() {
  const { db, me } = useApp();
  const [sp] = useSearchParams();
  const loading = useLoading();
  const [f, setF] = useState<any>({
    q: sp.get("q") || "",
    branch: "",
    year: "",
    type: "",
    loc: "",
    pkg: "",
    dl: "",
    elig: false,
    saved: false,
  });
  const set = (k: string) => (e: any) =>
    setF({
      ...f,
      [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    });
  const locs = [...new Set(db.drives.map((d: any) => d.location))] as string[];
  const list = useMemo(
    () =>
      db.drives
        .filter((d: any) => d.status === "published")
        .filter((d: any) => {
          const c = db.companies.find((x: any) => x.id === d.companyId);
          const s = (
            c?.name +
            " " +
            d.title +
            " " +
            d.skills.join(" ")
          ).toLowerCase();
          return (
            (!f.q || s.includes(f.q.toLowerCase())) &&
            (!f.branch || d.branches.includes(f.branch)) &&
            (!f.year || d.years.includes(+f.year)) &&
            (!f.type || d.type === f.type) &&
            (!f.loc || d.location === f.loc) &&
            (!f.pkg || d.lpa >= +f.pkg) &&
            (!f.dl || daysLeft(d.deadline) <= +f.dl) &&
            (!f.elig || isEligible(me, d)) &&
            (!f.saved ||
              db.saved.some((x: any) => x.u === me.id && x.d === d.id))
          );
        })
        .sort(
          (a: any, b: any) => +new Date(a.deadline) - +new Date(b.deadline),
        ),
    [db, f],
  );
  return (
    <>
      <PageHead
        title="Campus drives"
        sub="Published recruitment drives, closest deadline first."
      />
      <div className="card mb-6 p-4">
        <div className="relative mb-3">
          <Search
            size={16}
            className="absolute left-4 top-3.5 text-slate-400"
          />
          <input
            aria-label="Search drives"
            className="input pl-10"
            placeholder="Search company, role or skill"
            value={f.q}
            onChange={set("q")}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <select
            aria-label="Branch"
            className="input"
            value={f.branch}
            onChange={set("branch")}
          >
            <option value="">Any branch</option>
            {BRANCHES.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
          <select
            aria-label="Graduation year"
            className="input"
            value={f.year}
            onChange={set("year")}
          >
            <option value="">Any year</option>
            {[2026, 2027, 2028].map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>
          <select
            aria-label="Job type"
            className="input"
            value={f.type}
            onChange={set("type")}
          >
            <option value="">Any job type</option>
            {JOB_TYPES.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
          <select
            aria-label="Location"
            className="input"
            value={f.loc}
            onChange={set("loc")}
          >
            <option value="">Any location</option>
            {locs.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
          <select
            aria-label="Minimum package"
            className="input"
            value={f.pkg}
            onChange={set("pkg")}
          >
            <option value="">Any package</option>
            <option value="5">₹5 LPA +</option>
            <option value="8">₹8 LPA +</option>
            <option value="12">₹12 LPA +</option>
          </select>
          <select
            aria-label="Deadline"
            className="input"
            value={f.dl}
            onChange={set("dl")}
          >
            <option value="">Any deadline</option>
            <option value="7">Within 7 days</option>
            <option value="14">Within 14 days</option>
            <option value="30">Within 30 days</option>
          </select>
        </div>
        <div className="mt-3 flex flex-wrap gap-5 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={f.elig} onChange={set("elig")} />
            Only drives I am eligible for
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={f.saved} onChange={set("saved")} />
            Bookmarked
          </label>
          <button
            className="ml-auto font-semibold text-brand-600"
            onClick={() =>
              setF({
                q: "",
                branch: "",
                year: "",
                type: "",
                loc: "",
                pkg: "",
                dl: "",
                elig: false,
                saved: false,
              })
            }
          >
            Clear filters
          </button>
        </div>
      </div>
      {loading ? (
        <Skeleton n={6} />
      ) : list.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((d: any) => (
            <DriveCard key={d.id} d={d} />
          ))}
        </div>
      ) : (
        <Empty
          title="No drives match"
          hint="Try removing a filter or searching for a different company."
        />
      )}
    </>
  );
}

export function DriveDetail() {
  const { id } = useParams();
  const { drive, company, me, db, apply, flash } = useApp();
  const d = drive(id!);
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [ans, setAns] = useState("");
  const [docs, setDocs] = useState<string[]>([]);
  const [err, setErr] = useState("");
  const [done, setDone] = useState<any>(null);
  if (!d || d.status === "draft")
    return (
      <Empty
        title="Drive not found"
        hint="It may have been removed or is not published yet."
        action={
          <Link to="/drives" className="btn btn-primary">
            Back to drives
          </Link>
        }
      />
    );
  const c = company(d.companyId);
  const cr = criteria(me, d);
  const ok = cr.every((x) => x.ok);
  const existing = db.apps.find(
    (a: any) => a.driveId === d.id && a.studentId === me.id,
  );
  const closed = d.status !== "published" || daysLeft(d.deadline) < 0;
  const notOpen = new Date(d.opensAt) > new Date();
  const submit = () => {
    if (ans.trim().length < 20)
      return setErr(
        "Tell us in at least 20 characters why you are a good fit.",
      );
    if (docs.length < d.docs.length)
      return setErr("Confirm that you will carry all required documents.");
    const r = apply(d.id, ans);
    if (r.error) return setErr(r.error);
    setDone(r.app);
    flash("Application submitted");
  };
  const sec = (t: string, ch: any) => (
    <section className="card p-6">
      <h2 className="mb-3 text-xl font-bold">{t}</h2>
      {ch}
    </section>
  );
  const ul = (a: string[]) => (
    <ul className="list-disc space-y-1.5 pl-5 text-slate-600">
      {a.map((x) => (
        <li key={x}>{x}</li>
      ))}
    </ul>
  );
  return (
    <>
      <button
        onClick={() => nav(-1)}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-ink"
      >
        <ArrowLeft size={16} />
        Back
      </button>
      <div className="mb-6 rounded-3xl bg-white p-6 shadow-soft sm:p-8">
        <div className="flex flex-wrap items-center gap-4">
          <Mono c={c} size={64} />
          <div>
            <p className="text-slate-500">
              {c?.name} · {c?.industry}
            </p>
            <h1 className="text-3xl font-extrabold sm:text-4xl">{d.title}</h1>
          </div>
          <div className="ml-auto flex gap-2">
            <Badge s={d.status} />
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="chip">{pay(d)}</span>
          {d.lpa > 0 && d.stipend > 0 && (
            <span className="chip">Stipend ₹{d.stipend / 1000}k</span>
          )}
          <span className="chip">{d.type}</span>
          <span className="chip">
            <MapPin size={12} />
            {d.location} · {d.mode}
          </span>
          <span className="chip">
            <Briefcase size={12} />
            {d.openings} openings
          </span>
        </div>
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5">
          {sec("About the role", <p className="text-slate-600">{d.jd}</p>)}
          {sec("Responsibilities", ul(d.responsibilities))}
          {sec(
            "Skills required",
            <div className="flex flex-wrap gap-2">
              {d.skills.map((s: string) => (
                <span className="chip" key={s}>
                  {s}
                </span>
              ))}
            </div>,
          )}
          {sec(
            "Selection process",
            <ol className="space-y-3">
              {d.rounds.map((r: string, i: number) => (
                <li key={r} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-navy-700">
                    {i + 1}
                  </span>
                  {r}
                </li>
              ))}
            </ol>,
          )}
          {sec("Documents to carry", ul(d.docs))}
          {sec(
            `About ${c?.name}`,
            <>
              <p className="text-slate-600">{c?.description}</p>
              <p className="mt-2 text-sm text-slate-500">
                Headquarters: {c?.hq}
              </p>
            </>,
          )}
        </div>
        <aside className="space-y-5 lg:sticky lg:top-24">
          <div className="card p-6">
            <h2 className="text-lg font-bold">Your eligibility</h2>
            <ul className="mt-3 space-y-2.5">
              {cr.map((x) => (
                <li key={x.label} className="flex items-start gap-2 text-sm">
                  {x.ok ? (
                    <CheckCircle2
                      size={18}
                      className="mt-0.5 shrink-0 text-emerald-600"
                    />
                  ) : (
                    <XCircle
                      size={18}
                      className="mt-0.5 shrink-0 text-red-500"
                    />
                  )}
                  <span className={x.ok ? "" : "font-medium text-red-700"}>
                    {x.label}
                  </span>
                </li>
              ))}
            </ul>
            {!ok && (
              <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-700">
                You do not meet every criterion. If your details are outdated,{" "}
                <Link className="font-semibold underline" to="/profile">
                  update your profile
                </Link>
                .
              </p>
            )}
            <div className="mt-5 border-t border-slate-100 pt-4 text-sm">
              <p className="text-slate-500">
                Applications open {fmtDT(d.opensAt)}
              </p>
              <p className="font-semibold text-ink">
                Deadline {fmtDT(d.deadline)}
              </p>
            </div>
            {existing ? (
              <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm">
                <p className="font-semibold text-emerald-800">
                  You applied · {existing.ref}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <Badge s={existing.status} />
                  <Link
                    to="/my-applications"
                    className="font-semibold text-emerald-800 underline"
                  >
                    Track
                  </Link>
                </div>
              </div>
            ) : (
              <button
                className="btn btn-primary mt-4 w-full"
                disabled={!ok || closed || notOpen}
                onClick={() => {
                  setErr("");
                  setOpen(true);
                }}
              >
                {closed
                  ? "Applications closed"
                  : notOpen
                    ? "Opens soon"
                    : "Apply now"}
              </button>
            )}
          </div>
        </aside>
      </div>
      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setDone(null);
        }}
        title={done ? "Application submitted" : `Apply to ${c?.name}`}
        wide
      >
        {done ? (
          <div className="text-center">
            <FileCheck2 className="mx-auto text-emerald-600" size={48} />
            <p className="mt-3 text-slate-600">
              Your application for <b>{d.title}</b> has been sent to the
              placement cell.
            </p>
            <p className="mx-auto mt-4 w-fit rounded-xl bg-brand-50 px-5 py-3 font-display text-2xl font-bold text-ink">
              {done.ref}
            </p>
            <div className="mt-6 flex justify-center gap-2">
              <Link to="/my-applications" className="btn btn-primary">
                View my applications
              </Link>
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setOpen(false);
                  setDone(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-brand-50 p-3 text-sm">
              <span>
                <b className="text-ink">Resume:</b>{" "}
                {me.resume || "Not uploaded"}
              </span>
              <Link to="/profile" className="font-semibold text-brand-600">
                {me.resume ? "Replace" : "Upload"}
              </Link>
            </div>
            <Field
              label="Why are you a good fit for this role?"
              hint={`${ans.length} characters`}
            >
              <textarea
                rows={4}
                className="input"
                value={ans}
                onChange={(e) => setAns(e.target.value)}
              />
            </Field>
            <fieldset>
              <legend className="label">I will carry these documents</legend>
              {d.docs.map((x: string) => (
                <label
                  key={x}
                  className="mr-5 inline-flex items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={docs.includes(x)}
                    onChange={(e) =>
                      setDocs(
                        e.target.checked
                          ? [...docs, x]
                          : docs.filter((y) => y !== x),
                      )
                    }
                  />
                  {x}
                </label>
              ))}
            </fieldset>
            {err && (
              <p
                role="alert"
                className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700"
              >
                {err}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <button className="btn btn-ghost" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={submit}>
                Submit application
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

const FLOW = [
  "Applied",
  "Under Review",
  "Shortlisted",
  "Assessment Scheduled",
  "Interview Scheduled",
  "Selected",
];
export function MyApps() {
  const { db, me, drive, company, withdraw, flash } = useApp();
  const [tab, setTab] = useState("All");
  const [w, setW] = useState<any>(null);
  const mine = db.apps
    .filter((a: any) => a.studentId === me.id)
    .sort((a: any, b: any) => +new Date(b.appliedAt) - +new Date(a.appliedAt))
    .filter((a: any) => tab === "All" || a.status === tab);
  return (
    <>
      <PageHead
        title="My applications"
        sub="Every application and where it stands."
      />
      <div className="mb-5 flex flex-wrap gap-2">
        {[
          "All",
          "Applied",
          "Under Review",
          "Shortlisted",
          "Interview Scheduled",
          "Selected",
          "Rejected",
          "Withdrawn",
        ].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${tab === t ? "bg-ink text-white" : "bg-white text-slate-600 hover:bg-brand-100"}`}
          >
            {t}
          </button>
        ))}
      </div>
      {mine.length ? (
        <div className="space-y-4">
          {mine.map((a: any) => {
            const d = drive(a.driveId);
            const c = company(d.companyId);
            const idx = FLOW.indexOf(a.status);
            const ended = ["Rejected", "Withdrawn"].includes(a.status);
            return (
              <div key={a.id} className="card p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-4">
                  <Mono c={c} />
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/drives/${d.id}`}
                      className="font-bold text-ink hover:underline"
                    >
                      {d.title}
                    </Link>
                    <p className="text-sm text-slate-500">
                      {c?.name} · Ref {a.ref} · Applied {fmtDate(a.appliedAt)}
                    </p>
                  </div>
                  <Badge s={a.status} />
                  {!ended && a.status !== "Selected" && (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setW(a)}
                    >
                      Withdraw
                    </button>
                  )}
                </div>
                {!ended && (
                  <div className="mt-5 hidden grid-cols-6 gap-1 sm:grid">
                    {FLOW.map((s, i) => (
                      <div key={s}>
                        <div
                          className={`h-1.5 rounded-full ${i <= idx ? "bg-ink" : "bg-slate-200"}`}
                        />
                        <p
                          className={`mt-1.5 text-[11px] ${i <= idx ? "font-semibold text-ink" : "text-slate-400"}`}
                        >
                          {s}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                <details className="mt-4 text-sm">
                  <summary className="cursor-pointer font-semibold text-brand-600">
                    Status history
                  </summary>
                  <ul className="mt-2 space-y-1.5 border-l-2 border-brand-100 pl-4">
                    {[...a.history].reverse().map((h: any, i: number) => (
                      <li key={i}>
                        <b className="text-ink">{h.status}</b>{" "}
                        <span className="text-slate-500">· {fmtDT(h.at)}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              </div>
            );
          })}
        </div>
      ) : (
        <Empty
          title={
            tab === "All" ? "No applications yet" : `Nothing marked ${tab}`
          }
          hint="Apply to a drive you are eligible for and it will show up here."
          action={
            <Link to="/drives" className="btn btn-primary">
              Browse drives
            </Link>
          }
        />
      )}
      <Confirm
        open={!!w}
        onClose={() => setW(null)}
        danger
        label="Withdraw application"
        title="Withdraw this application?"
        text="The placement cell will see it as withdrawn. You cannot reapply to this drive afterwards."
        onYes={() => {
          withdraw(w.id);
          flash("Application withdrawn");
        }}
      />
    </>
  );
}

export function Notifications() {
  const { db, me, read } = useApp();
  const list = db.notes
    .filter((n: any) => n.userId === me.id)
    .sort((a: any, b: any) => +new Date(b.at) - +new Date(a.at));
  const nav = useNavigate();
  const anns = db.anns.slice(0, 3);
  return (
    <>
      <PageHead
        title="Notifications"
        sub="Updates on your applications and announcements from the cell."
        action={
          <button className="btn btn-ghost btn-sm" onClick={() => read()}>
            Mark all as read
          </button>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {list.length ? (
          <div className="card divide-y divide-slate-100">
            {list.map((n: any) => (
              <button
                key={n.id}
                onClick={() => {
                  read(n.id);
                  n.driveId && nav(`/drives/${n.driveId}`);
                }}
                className="flex w-full items-start gap-3 p-4 text-left hover:bg-brand-50/50"
              >
                <span
                  className={`mt-2 h-2 w-2 shrink-0 rounded-full ${n.read ? "bg-transparent" : "bg-amber-500"}`}
                />
                <span>
                  <span
                    className={`block text-ink ${n.read ? "" : "font-bold"}`}
                  >
                    {n.title}
                  </span>
                  <span className="block text-sm text-slate-600">
                    {n.message}
                  </span>
                  <span className="text-xs text-slate-400">{fmtDT(n.at)}</span>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <Empty
            title="No notifications"
            hint="Status changes and announcements will appear here."
          />
        )}
        <div className="card p-5">
          <h2 className="mb-3 text-lg font-bold">
            Placement cell announcements
          </h2>
          {anns.map((a: any) => (
            <div
              key={a.id}
              className="border-t border-slate-100 py-3 first:border-0"
            >
              <span className="chip">{a.kind}</span>
              <p className="mt-2 font-semibold text-ink">{a.title}</p>
              <p className="text-sm text-slate-600">{a.content}</p>
              <p className="mt-1 text-xs text-slate-400">{fmtDT(a.at)}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export function Profile() {
  const { me, updateProfile, flash } = useApp();
  const [f, setF] = useState<any>({ ...me });
  const [e, setE] = useState<any>({});
  const [fe, setFe] = useState("");
  const set = (k: string) => (ev: any) => setF({ ...f, [k]: ev.target.value });
  const save = (ev: any) => {
    ev.preventDefault();
    const x: any = {};
    if (f.name.trim().length < 3) x.name = "Enter your full name.";
    if (f.phone && !/^[6-9]\d{9}$/.test(f.phone))
      x.phone = "Enter a 10-digit Indian mobile number.";
    if (!(+f.cgpa >= 0 && +f.cgpa <= 10))
      x.cgpa = "CGPA must be between 0 and 10.";
    setE(x);
    if (Object.keys(x).length) return;
    updateProfile({
      name: f.name,
      phone: f.phone,
      branch: f.branch,
      year: +f.year,
      cgpa: +f.cgpa,
      backlogs: +f.backlogs,
    });
    flash("Profile saved");
  };
  const file = (ev: any) => {
    const x = ev.target.files[0];
    if (!x) return;
    if (!/\.(pdf|docx?)$/i.test(x.name))
      return setFe("Upload a PDF or Word file.");
    if (x.size > 2 * 1024 * 1024) return setFe("File is larger than 2 MB.");
    setFe("");
    updateProfile({ resume: x.name });
    setF({ ...f, resume: x.name });
    flash(me.resume ? "Resume replaced" : "Resume uploaded");
  };
  const done = ["name", "usn", "branch", "cgpa", "phone", "resume"].filter(
    (k) => f[k] !== "" && f[k] != null,
  ).length;
  return (
    <>
      <PageHead
        title="Your profile"
        sub="Eligibility for every drive is calculated from these details."
      />
      <div className="grid items-start gap-6 lg:grid-cols-[1.5fr_1fr]">
        <form
          onSubmit={save}
          noValidate
          className="card grid gap-4 p-6 sm:grid-cols-2"
        >
          <Field label="Full name" error={e.name}>
            <input className="input" value={f.name} onChange={set("name")} />
          </Field>
          <Field label="USN" hint="Contact the cell to change your USN.">
            <input className="input bg-slate-50" value={f.usn} disabled />
          </Field>
          <Field label="Email">
            <input className="input bg-slate-50" value={f.email} disabled />
          </Field>
          <Field label="Phone (optional)" error={e.phone}>
            <input
              className="input"
              value={f.phone}
              onChange={set("phone")}
              inputMode="numeric"
            />
          </Field>
          <Field label="Branch">
            <select className="input" value={f.branch} onChange={set("branch")}>
              {BRANCHES.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </Field>
          <Field label="Graduation year">
            <select className="input" value={f.year} onChange={set("year")}>
              {[2026, 2027, 2028].map((y) => (
                <option key={y}>{y}</option>
              ))}
            </select>
          </Field>
          <Field label="CGPA" error={e.cgpa}>
            <input className="input" value={f.cgpa} onChange={set("cgpa")} />
          </Field>
          <Field label="Active backlogs">
            <input
              type="number"
              min={0}
              className="input"
              value={f.backlogs}
              onChange={set("backlogs")}
            />
          </Field>
          <div className="sm:col-span-2">
            <button className="btn btn-primary">Save changes</button>
          </div>
        </form>
        <div className="space-y-5">
          <div className="card p-6">
            <h2 className="text-lg font-bold">Resume</h2>
            <p className="mt-1 text-sm text-slate-500">
              PDF or Word, up to 2 MB. Stored privately.
            </p>
            <div className="mt-4 flex items-center gap-3 rounded-xl bg-brand-50 p-4 text-sm">
              <FileCheck2 className="text-brand-600" />
              {me.resume || "No resume uploaded"}
            </div>
            <label className="btn btn-ghost mt-4 cursor-pointer">
              <Upload size={16} />
              {me.resume ? "Replace resume" : "Upload resume"}
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="sr-only"
                onChange={file}
              />
            </label>
            {fe && (
              <p role="alert" className="mt-2 text-xs font-medium text-red-600">
                {fe}
              </p>
            )}
          </div>
          <div className="card p-6">
            <h2 className="text-lg font-bold">Profile completeness</h2>
            <div className="mt-3 h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-amber-400"
                style={{ width: `${(done / 6) * 100}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-slate-500">
              {done} of 6 key fields complete
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
