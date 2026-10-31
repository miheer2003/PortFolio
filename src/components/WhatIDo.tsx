import { useEffect, useRef } from "react";
import gsap from "gsap";
import "./styles/WhatIDo.css";
import SectionHead from "./SectionHead";
import { StarDock } from "./ScrollStar";
import { prefersReducedMotion } from "./utils/lenis";

const CAPABILITIES = [
  {
    no: "A",
    title: "AI Engineering",
    sub: "Intelligent systems & automation",
    body: "AI-powered products built on LLMs, NLP, prompt engineering, RAG and agent workflows, designed to make software smarter and teams faster.",
    tags: ["Python", "LangGraph", "LangChain", "MCP", "RAG", "AutoGen", "CrewAI", "TensorFlow", "PyTorch", "OpenCV"],
  },
  {
    no: "B",
    title: "Software Engineering",
    sub: "Scalable full-stack applications",
    body: "High-performance web applications with Java, Spring Boot, React, REST APIs and MySQL, with clean architecture and a strong focus on user experience.",
    tags: ["Ruby on Rails", "Java", "Spring Boot", "React", "TypeScript", "PostgreSQL", "Docker", "REST APIs", "AWS"],
  },
];

const fine = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const clamp = gsap.utils.clamp(-1, 1);

/* Extruded letter: stacked copies at falling depth, cream at the face to mocha at the back. */
const CREAM = [233, 216, 191];
const MOCHA = [164, 120, 100];
const shade = (t: number) =>
  `rgb(${CREAM.map((c, k) => Math.round(c + (MOCHA[k] - c) * t)).join(",")})`;
const LAYERS = window.matchMedia("(pointer: coarse)").matches ? 8 : 12;

const Glyph = ({ ch }: { ch: string }) => (
  <span className="cap-glyph" aria-hidden="true">
    {Array.from({ length: LAYERS }, (_, i) => (
      <span
        key={i}
        className={i === 0 ? "cap-glyph-face" : "cap-glyph-side"}
        style={
          {
            "--z": `${(LAYERS - 1 - i) * (30 / (LAYERS - 1)) + 2}px`,
            ...(i ? { color: shade(0.2 + (0.65 * i) / (LAYERS - 1)) } : null),
          } as React.CSSProperties
        }
      >
        {ch}
      </span>
    ))}
  </span>
);

const spot = (e: React.PointerEvent<HTMLElement>) => {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
  el.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
};

const WhatIDo = () => {
  const rootRef = useRef<HTMLElement>(null);

  // One loop drives the tilt: the pointer on laptops, scroll position otherwise.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;
    const isFine = fine();
    const cells = Array.from(root.querySelectorAll<HTMLElement>(".cap-cell"));
    const cards = cells.map((c) => c.querySelector<HTMLElement>(".cap-card") as HTMLElement);
    const st = cards.map(() => ({ rx: 0, ry: 0, px: 0, py: 0, hover: false, last: "" }));

    const tick = () => {
      const vh = window.innerHeight;
      cells.forEach((cell, i) => {
        const s = st[i];
        let tx: number;
        let ty: number;
        if (s.hover) {
          tx = s.px;
          ty = s.py;
        } else {
          const r = cell.getBoundingClientRect();
          const c = clamp((r.top + r.height / 2 - vh / 2) / (vh / 2));
          const side = i % 2 ? -1 : 1;
          tx = c * (isFine ? 6 : 11);
          ty = Math.sin(c * Math.PI * 0.5) * side * (isFine ? 4 : 9);
        }
        s.rx += (tx - s.rx) * 0.1;
        s.ry += (ty - s.ry) * 0.1;
        const t = `rotateX(${s.rx.toFixed(2)}deg) rotateY(${s.ry.toFixed(2)}deg)`;
        if (t !== s.last) cards[i].style.transform = s.last = t;
      });
    };

    const offs: Array<() => void> = [];
    if (isFine) {
      cards.forEach((card, i) => {
        const move = (e: PointerEvent) => {
          const r = card.getBoundingClientRect();
          st[i].hover = true;
          st[i].py = ((e.clientX - r.left) / r.width - 0.5) * 22;
          st[i].px = (0.5 - (e.clientY - r.top) / r.height) * 16;
        };
        const leave = () => (st[i].hover = false);
        card.addEventListener("pointermove", move);
        card.addEventListener("pointerleave", leave);
        offs.push(() => {
          card.removeEventListener("pointermove", move);
          card.removeEventListener("pointerleave", leave);
        });
      });
    }

    let running = false;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !running) gsap.ticker.add(tick);
        if (!e.isIntersecting && running) gsap.ticker.remove(tick);
        running = e.isIntersecting;
      },
      { rootMargin: "120px 0px" }
    );
    io.observe(root);

    return () => {
      io.disconnect();
      if (running) gsap.ticker.remove(tick);
      offs.forEach((off) => off());
      cards.forEach((c) => (c.style.transform = ""));
    };
  }, []);

  return (
    <section className="section capabilities" id="capabilities" ref={rootRef}>
      <div className="wrap">
        <SectionHead index="03" label="Capabilities" />
        <h2 className="sec-title" data-reveal="lines">
          What <StarDock before="I" /> <span className="serif accent-text">do</span>
        </h2>

        <div className="cap-grid" data-reveal="stagger">
          {CAPABILITIES.map((c) => (
            <div className="cap-cell" key={c.title}>
              <article className="cap-card" onPointerMove={spot}>
                <Glyph ch={c.no} />
                <div className="cap-top">
                  <span className="mono cap-no">{c.no}</span>
                  <span className="mono">{c.sub}</span>
                </div>
                <h3 className="cap-title">{c.title}</h3>
                <p className="cap-body">{c.body}</p>
                <ul className="cap-tags">
                  {c.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatIDo;
