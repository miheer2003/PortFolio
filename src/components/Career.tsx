import { useEffect, useRef } from "react";
import gsap from "gsap";
import "./styles/Career.css";
import SectionHead from "./SectionHead";
import { prefersReducedMotion } from "./utils/lenis";
import { StarDock } from "./ScrollStar";

const ENTRIES = [
  {
    period: "Now",
    role: "AI Engineer · Ruby on Rails",
    org: "Nutsovertech",
    body: "Building LLM-powered features and agentic workflows, and handling Ruby on Rails projects end to end, from client requirements to production releases.",
    tags: ["Gen AI", "Agents", "Ruby on Rails"],
    current: true,
  },
  {
    period: "2025 – 2026",
    role: "PG-DAC, Advanced Computing",
    org: "CDAC ACTS, Pune",
    body: "Post Graduate Diploma in Advanced Computing (Aug 2025 – Jan 2026). Secured All India Rank (AIR) 23.",
  },
  {
    period: "2025",
    role: "Software Development Intern",
    org: "Xpedio Live, Pune",
    body: "Built a full-stack Doctor Management Application with React and Spring Boot. Designed 10+ REST APIs with optimised MySQL queries, cutting data load time by 35%.",
  },
  {
    period: "2022 – 2025",
    role: "B.Tech, Computer Engineering",
    org: "MIT ADT University",
    body: "First Class. Coursework in OOP, DSA, DBMS, Computer Networks, Software Engineering, Operating Systems and Web Development.",
  },
  {
    period: "2019 – 2022",
    role: "Diploma, Computer Science",
    org: "Sandip Polytechnic, MSBTE",
    body: "Graduated with 80.11%. Coursework in C, OOP (C++), Data Structures, Operating Systems, Computer Networks and Web Development.",
  },
];

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const easeOut = (t: number) => 1 - (1 - t) * (1 - t);

/** Rolodex: each card turns on a drum axis behind the page as it scrolls in and out. */
const DRUM = 150; // px from the card to the axis
const ENTER_DEG = 62;
const EXIT_DEG = 42;

const Career = () => {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;
    const list = root.querySelector<HTMLElement>(".exp-list");
    const rail = root.querySelector<HTMLElement>(".exp-rail");
    const progress = root.querySelector<HTMLElement>(".exp-progress");
    const tip = root.querySelector<HTMLElement>(".exp-tip");
    const items = Array.from(root.querySelectorAll<HTMLElement>(".exp-item"));
    const cards = items.map((li) => li.querySelector<HTMLElement>(".exp-card"));
    if (!list || !rail || !progress || !tip || cards.some((c) => !c)) return;

    root.classList.add("is-3d");
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    let railH = rail.offsetHeight;
    let nodeY: number[] = [];
    const measure = () => {
      railH = rail.offsetHeight;
      // Node centre along the rail, so a node lights up when the playhead reaches it.
      nodeY = items.map((li) => {
        const node = li.querySelector<HTMLElement>(".exp-node");
        const mid = node ? node.offsetTop + node.offsetHeight / 2 : 0;
        return li.offsetTop + mid - rail.offsetTop;
      });
    };
    measure();

    const lastT = cards.map(() => "");
    const lastO = cards.map(() => "");
    const passed = items.map(() => false);
    let lastP = -1;
    let focus = -1;
    let hovered = -1;

    const tick = () => {
      const vh = window.innerHeight;
      const lr = list.getBoundingClientRect();
      const rects = items.map((li) => li.getBoundingClientRect());

      // Rail fill + playhead: list top at 70% of the screen -> list bottom at 60%.
      const p = clamp01((vh * 0.7 - lr.top) / (lr.height + vh * 0.1));
      if (Math.abs(p - lastP) > 0.0004) {
        lastP = p;
        progress.style.transform = `scaleY(${p.toFixed(4)})`;
        const y = p * railH;
        tip.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
        // The playhead slips into each node as it passes, then reappears below it.
        let gap = Infinity;
        items.forEach((li, i) => {
          gap = Math.min(gap, Math.abs(y - nodeY[i]));
          const on = y >= nodeY[i];
          if (on !== passed[i]) li.classList.toggle("is-passed", (passed[i] = on));
        });
        const edge = Math.min(y, railH - y);
        tip.style.opacity = clamp01(Math.min(gap - 7, edge) / 16).toFixed(3);
      }

      let best = -1;
      let bestD = Infinity;
      rects.forEach((r, i) => {
        const enter = easeOut(clamp01((vh - r.top) / (vh * 0.34)));
        const exit = clamp01((vh * 0.24 - r.bottom) / (vh * 0.24));
        const deg = -ENTER_DEG * (1 - enter) + EXIT_DEG * exit * exit;
        const op = (0.08 + 0.92 * enter) * (1 - 0.7 * exit);

        const t =
          Math.abs(deg) < 0.05
            ? "none"
            : `translate3d(0,0,${-DRUM}px) rotateX(${deg.toFixed(2)}deg) translate3d(0,0,${DRUM}px)`;
        const o = op > 0.995 ? "" : op.toFixed(3);
        const card = cards[i] as HTMLElement;
        if (t !== lastT[i]) card.style.transform = lastT[i] = t;
        if (o !== lastO[i]) card.style.opacity = lastO[i] = o;

        // Focus: the settled card nearest 45% of the screen height.
        if (enter > 0.85) {
          const d = Math.abs(r.top + r.height / 2 - vh * 0.45);
          if (d < bestD) {
            bestD = d;
            best = i;
          }
        }
      });

      const next = hovered >= 0 ? hovered : best;
      if (next !== focus) {
        if (focus >= 0) items[focus].classList.remove("is-focus");
        if (next >= 0) items[next].classList.add("is-focus");
        list.classList.toggle("has-focus", next >= 0);
        focus = next;
      }
    };

    let running = false;
    const start = () => {
      if (!running) gsap.ticker.add(tick);
      running = true;
    };
    const stop = () => {
      if (running) gsap.ticker.remove(tick);
      running = false;
    };
    tick(); // set the first frame before the section is ever seen
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), {
      rootMargin: "200px 0px",
    });
    io.observe(root);
    const ro = new ResizeObserver(() => {
      measure();
      lastP = -1;
    });
    ro.observe(list);

    const enter = (i: number) => () => (hovered = i);
    const leave = () => (hovered = -1);
    const handlers = items.map((_, i) => enter(i));
    if (fine) {
      items.forEach((li, i) => {
        li.addEventListener("pointerenter", handlers[i]);
        li.addEventListener("pointerleave", leave);
      });
    }

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      if (fine) {
        items.forEach((li, i) => {
          li.removeEventListener("pointerenter", handlers[i]);
          li.removeEventListener("pointerleave", leave);
        });
      }
      root.classList.remove("is-3d");
      list.classList.remove("has-focus");
      items.forEach((li, i) => {
        li.classList.remove("is-focus", "is-passed");
        const card = cards[i] as HTMLElement;
        card.style.transform = "";
        card.style.opacity = "";
      });
      progress.style.transform = "";
      tip.style.transform = "";
    };
  }, []);

  return (
    <section className="section experience" id="experience" ref={rootRef}>
      <div className="wrap">
        <SectionHead index="04" label="Experience & education" />
        <h2 className="sec-title" data-reveal="lines">
          The <StarDock before={<span className="serif accent-text">journey</span>} /> so far
        </h2>

        <ol className="exp-list">
          <span className="exp-rail" aria-hidden="true">
            <span className="exp-progress" />
            <span className="exp-tip" />
          </span>
          {ENTRIES.map((e) => (
            <li key={e.role} className={`exp-item ${e.current ? "is-current" : ""}`}>
              <span className="exp-node" aria-hidden="true" />
              <div className="exp-card">
                <span className="mono exp-period">{e.period}</span>
                <div className="exp-head">
                  <h3>{e.role}</h3>
                  <span className="exp-org">{e.org}</span>
                </div>
                <div className="exp-text">
                  <p className="exp-body">{e.body}</p>
                  {"tags" in e && e.tags && (
                    <ul className="exp-tags mono">
                      {e.tags.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default Career;
