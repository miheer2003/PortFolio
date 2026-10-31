import { useEffect, useMemo, useRef, useState } from "react";
import type { Day, GithubData } from "../../api/github";
import { GH } from "../data/profile";
import "./styles/GitHubActivity.css";

const WEEKS = 26; // last ~6 months (phones show fewer via CSS)
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const parse = (d: string) => new Date(`${d}T00:00:00`);
const ago = (iso: string) => {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 3600) return `${Math.max(1, Math.round(s / 60))}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  if (s < 86400 * 30) return `${Math.round(s / 86400)}d ago`;
  return `${Math.round(s / (86400 * 30))}mo ago`;
};

/** Small live GitHub strip: recent contribution squares + total + latest push. */
const GitHubActivity = () => {
  const rootRef = useRef<HTMLAnchorElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);
  const [data, setData] = useState<GithubData | null>(null);
  const [failed, setFailed] = useState(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const near = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        near.disconnect();
        fetch("/api/github")
          .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
          .then(setData)
          .catch(() => setFailed(true));
      },
      { rootMargin: "800px 0px" }
    );
    const seen = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setInView(true);
        seen.disconnect();
      },
      { threshold: 0.6 }
    );
    near.observe(el);
    seen.observe(el);
    return () => {
      near.disconnect();
      seen.disconnect();
    };
  }, []);

  const weeks = useMemo<(Day | null)[][]>(() => {
    if (!data) return Array.from({ length: WEEKS }, () => Array<Day | null>(7).fill(null));
    return data.weeks.slice(-WEEKS).map((w) => {
      const col: (Day | null)[] = Array(7).fill(null);
      w.forEach((d) => (col[parse(d.d).getDay()] = d));
      return col;
    });
  }, [data]);

  const showTip = (e: React.PointerEvent) => {
    const cell = (e.target as HTMLElement).closest<HTMLElement>("[data-d]");
    const tip = tipRef.current;
    const root = rootRef.current;
    if (!tip || !root) return;
    if (!cell) return tip.classList.remove("is-on");
    const c = Number(cell.dataset.c);
    const t = parse(cell.dataset.d!);
    tip.textContent = `${c || "No"} contribution${c === 1 ? "" : "s"} · ${t.getDate()} ${MONTHS[t.getMonth()]}`;
    const r = cell.getBoundingClientRect();
    const box = root.getBoundingClientRect();
    tip.style.transform = `translate(${r.left + r.width / 2 - box.left}px, ${r.top - box.top - 6}px) translate(-50%, -100%)`;
    tip.classList.add("is-on");
  };

  if (failed) return null;
  const latest = data?.repos[0];

  return (
    <a
      ref={rootRef}
      href={GH}
      target="_blank"
      rel="noopener noreferrer"
      className={`ghm ${data ? "is-ready" : "is-loading"} ${data && inView ? "is-in" : ""}`}
      aria-label={data ? `${data.total} GitHub contributions in the last year` : "GitHub activity"}
      onPointerMove={showTip}
      onPointerLeave={() => tipRef.current?.classList.remove("is-on")}
    >
      <span className="ghm-grid" aria-hidden="true">
        {weeks.map((col, wi) => (
          <span className="ghm-week" key={wi}>
            {col.map((d, di) =>
              d ? (
                <span
                  key={di}
                  className={`ghm-cell l${d.l}`}
                  data-d={d.d}
                  data-c={d.c}
                  style={{ "--i": wi + di } as React.CSSProperties}
                />
              ) : (
                <span key={di} className={`ghm-cell ${data ? "is-empty" : "l0"}`} />
              )
            )}
          </span>
        ))}
      </span>

      <span className="ghm-text mono">
        <span className="ghm-total">
          <span className="live-dot" />
          <strong>{data ? data.total : "···"}</strong> contributions<span className="ghm-long"> this year</span>
        </span>
        <span className="ghm-latest">
          {latest ? (
            <>
              Latest<span className="ghm-long"> push</span> · {latest.name} · {ago(latest.pushed)}
            </>
          ) : (
            "Live from GitHub"
          )}
        </span>
      </span>

      <span className="ghm-tip mono" ref={tipRef} aria-hidden="true" />
    </a>
  );
};

export default GitHubActivity;
