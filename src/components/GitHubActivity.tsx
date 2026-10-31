import { useEffect, useMemo, useRef, useState } from "react";
import { MdArrowOutward } from "react-icons/md";
import type { Day, GithubData } from "../../api/github";
import { GH } from "../data/profile";
import { getGithub } from "./utils/github";
import "./styles/GitHubActivity.css";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const VISIBLE = 40; // roughly how many recent weeks fit; older ones are clipped by CSS

const parse = (d: string) => new Date(`${d}T00:00:00`);
const ago = (iso: string) => {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 3600) return `${Math.max(1, Math.round(s / 60))}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  if (s < 86400 * 30) return `${Math.round(s / 86400)}d ago`;
  return `${Math.round(s / (86400 * 30))}mo ago`;
};

/**
 * Closing row of the Work list: "More on GitHub" with live contribution
 * squares and the latest push, laid out on the same grid as the projects.
 */
const GitHubActivity = ({ onEnter }: { onEnter?: () => void }) => {
  const rowRef = useRef<HTMLAnchorElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);
  const [data, setData] = useState<GithubData | null>(null);
  const [failed, setFailed] = useState(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    const near = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        near.disconnect();
        getGithub()
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
    const row = rowRef.current;
    if (!tip || !row) return;
    if (!cell) return tip.classList.remove("is-on");
    const c = Number(cell.dataset.c);
    const t = parse(cell.dataset.d!);
    tip.textContent = `${c || "No"} contribution${c === 1 ? "" : "s"} · ${t.getDate()} ${MONTHS[t.getMonth()]}`;
    const r = cell.getBoundingClientRect();
    const box = row.getBoundingClientRect();
    tip.style.transform = `translate(${r.left + r.width / 2 - box.left}px, ${r.top - box.top - 8}px) translate(-50%, -100%)`;
    tip.classList.add("is-on");
  };

  const latest = data?.repos[0];
  const start = weeks.length - VISIBLE;

  return (
    <li className="work-item work-gh" data-reveal="fade" onPointerEnter={onEnter}>
      <a
        ref={rowRef}
        className={`work-row ${data ? "is-ready" : "is-loading"} ${data && inView ? "is-in" : ""}`}
        href={`${GH}?tab=repositories`}
        target="_blank"
        rel="noopener noreferrer"
        onPointerMove={showTip}
        onPointerLeave={() => tipRef.current?.classList.remove("is-on")}
      >
        <span className="mono work-index">+</span>
        <span className="work-title">
          More on <span className="serif accent-text">GitHub</span>
        </span>

        <span className="work-kind gh-kind">
          {failed ? (
            "All repositories"
          ) : (
            <>
              <span className="gh-total">
                <span className="live-dot" />
                {data ? data.total : "···"} contributions this year
              </span>
              <span className="mono gh-latest">
                {latest ? `Latest push · ${latest.name} · ${ago(latest.pushed)}` : "Live from GitHub"}
              </span>
            </>
          )}
        </span>

        <span className="work-tools gh-cal" aria-hidden="true">
          {!failed &&
            weeks.map((col, wi) => (
              <span className="gh-week" key={wi}>
                {col.map((d, di) =>
                  d ? (
                    <span
                      key={di}
                      className={`gh-cell l${d.l}`}
                      data-d={d.d}
                      data-c={d.c}
                      style={{ "--i": Math.max(0, wi - start) * 2 + di } as React.CSSProperties}
                    />
                  ) : (
                    <span key={di} className={`gh-cell ${data ? "is-empty" : "l0"}`} />
                  )
                )}
              </span>
            ))}
        </span>

        <span className="work-arrow" aria-hidden="true">
          <MdArrowOutward />
        </span>
        <span className="gh-tip mono" ref={tipRef} aria-hidden="true" />
      </a>
    </li>
  );
};

export default GitHubActivity;
