import { useEffect, useMemo, useRef, useState } from "react";
import { MdArrowOutward } from "react-icons/md";
import { SiGithub } from "react-icons/si";
import type { Day, GithubData } from "../../api/github";
import "./styles/GitHubActivity.css";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const parse = (d: string) => new Date(`${d}T00:00:00`);
const longDate = (d: string) => {
  const t = parse(d);
  return `${DAYS[t.getDay()]}, ${t.getDate()} ${MONTHS[t.getMonth()]}`;
};
const ago = (iso: string) => {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 3600) return `${Math.max(1, Math.round(s / 60))}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  if (s < 86400 * 30) return `${Math.round(s / 86400)}d ago`;
  return `${Math.round(s / (86400 * 30))}mo ago`;
};

const stats = (weeks: Day[][]) => {
  const n = new Date();
  const today = `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
  const days = weeks.flat().filter((d) => d.d <= today);
  let longest = 0;
  let run = 0;
  for (const d of days) {
    run = d.c > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  // Current streak: today may still be empty, so start from yesterday then.
  let current = 0;
  let i = days.length - 1;
  if (i >= 0 && days[i].c === 0) i -= 1;
  while (i >= 0 && days[i].c > 0) {
    current += 1;
    i -= 1;
  }
  const best = days.reduce((b, d) => (d.c > b.c ? d : b), { d: "", c: 0, l: 0 } as Day);
  return { active: days.filter((d) => d.c > 0).length, longest, current, best };
};

type State = { status: "loading" } | { status: "error" } | { status: "ok"; data: GithubData };

const GitHubActivity = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<State>({ status: "loading" });
  const [inView, setInView] = useState(false);

  // Fetch when the block gets close; animate when it is actually on screen.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    let fetched = false;
    const near = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || fetched) return;
        fetched = true;
        near.disconnect();
        fetch("/api/github")
          .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
          .then((data: GithubData) => setState({ status: "ok", data }))
          .catch(() => setState({ status: "error" }));
      },
      { rootMargin: "800px 0px" }
    );
    const seen = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setInView(true);
        seen.disconnect();
      },
      { threshold: 0.25 }
    );
    near.observe(el);
    seen.observe(el);
    return () => {
      near.disconnect();
      seen.disconnect();
    };
  }, []);

  const data = state.status === "ok" ? state.data : null;
  const s = useMemo(() => (data ? stats(data.weeks) : null), [data]);

  // Placeholder grid while loading keeps the layout from jumping.
  const weeks = useMemo<(Day | null)[][]>(() => {
    if (!data) return Array.from({ length: 53 }, () => Array<Day | null>(7).fill(null));
    return data.weeks.map((w) => {
      const col: (Day | null)[] = Array(7).fill(null);
      w.forEach((d) => (col[parse(d.d).getDay()] = d));
      return col;
    });
  }, [data]);

  const showTip = (e: React.PointerEvent) => {
    const cell = (e.target as HTMLElement).closest<HTMLElement>("[data-d]");
    const tip = tipRef.current;
    const root = rootRef.current;
    if (!cell || !tip || !root) return;
    const c = Number(cell.dataset.c);
    tip.textContent = `${c === 0 ? "No" : c} contribution${c === 1 ? "" : "s"} · ${longDate(cell.dataset.d!)}`;
    const r = cell.getBoundingClientRect();
    const box = root.getBoundingClientRect();
    tip.style.transform = `translate(${r.left + r.width / 2 - box.left}px, ${r.top - box.top - 8}px) translate(-50%, -100%)`;
    tip.classList.add("is-on");
  };
  const hideTip = () => tipRef.current?.classList.remove("is-on");

  if (state.status === "error") {
    return (
      <div className="gh gh-error" ref={rootRef}>
        <a className="mono link-line" href="https://github.com/miheer2003" target="_blank" rel="noopener noreferrer">
          See my latest activity on GitHub <MdArrowOutward />
        </a>
      </div>
    );
  }

  return (
    <div className={`gh ${data ? "is-ready" : "is-loading"} ${inView && data ? "is-in" : ""}`} ref={rootRef}>
      <div className="gh-top">
        <p className="mono gh-label">
          <span className="live-dot" /> Live from GitHub
          <a href="https://github.com/miheer2003" target="_blank" rel="noopener noreferrer" className="gh-user">
            <SiGithub /> miheer2003
          </a>
        </p>
        <p className="gh-total">
          <strong>{data ? data.total.toLocaleString("en-IN") : "—"}</strong>
          <span className="mono">contributions in the last year</span>
        </p>
      </div>

      <div
        className="gh-grid"
        role="img"
        aria-label={data ? `GitHub contribution calendar: ${data.total} contributions in the last year` : "Loading GitHub activity"}
        onPointerOver={showTip}
        onPointerLeave={hideTip}
      >
        <div className="gh-days mono" aria-hidden="true">
          <span />
          <span>Mon</span>
          <span />
          <span>Wed</span>
          <span />
          <span>Fri</span>
          <span />
        </div>
        {weeks.map((col, wi) => {
          const first = col.find(Boolean);
          const t = first ? parse(first.d) : null;
          const month = t && t.getDate() <= 7 ? MONTHS[t.getMonth()] : "";
          return (
            <div className="gh-week" key={wi}>
              <span className="gh-month mono" aria-hidden="true">
                {month}
              </span>
              {col.map((d, di) =>
                d ? (
                  <span
                    key={di}
                    className={`gh-cell l${d.l}`}
                    data-d={d.d}
                    data-c={d.c}
                    style={{ "--i": wi + di } as React.CSSProperties}
                  />
                ) : (
                  <span key={di} className={`gh-cell ${data ? "is-empty" : "l0"}`} />
                )
              )}
            </div>
          );
        })}
      </div>

      <div className="gh-legend mono" aria-hidden="true">
        Less
        {[0, 1, 2, 3, 4].map((l) => (
          <span key={l} className={`gh-cell l${l}`} />
        ))}
        More
      </div>

      <div className="gh-bottom">
        <dl className="gh-stats">
          <div>
            <dt className="mono">Active days</dt>
            <dd>{s ? s.active : "—"}</dd>
          </div>
          <div>
            <dt className="mono">Longest streak</dt>
            <dd>{s ? `${s.longest}d` : "—"}</dd>
          </div>
          <div>
            <dt className="mono">Current streak</dt>
            <dd>{s ? `${s.current}d` : "—"}</dd>
          </div>
          <div>
            <dt className="mono">Best day</dt>
            <dd>{s && s.best.c ? `${s.best.c} on ${longDate(s.best.d).slice(5)}` : "—"}</dd>
          </div>
        </dl>

        <ul className="gh-repos" aria-label="Recently pushed repositories">
          {(data?.repos ?? []).map((r) => (
            <li key={r.name}>
              <a href={r.url} target="_blank" rel="noopener noreferrer">
                <span className="gh-repo-name">{r.name}</span>
                <span className="mono gh-repo-meta">
                  {r.lang && (
                    <>
                      <span className="gh-lang" data-lang={r.lang} />
                      {r.lang} ·{" "}
                    </>
                  )}
                  pushed {ago(r.pushed)}
                </span>
                <MdArrowOutward className="gh-repo-arrow" />
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="gh-tip mono" ref={tipRef} aria-hidden="true" />
    </div>
  );
};

export default GitHubActivity;
