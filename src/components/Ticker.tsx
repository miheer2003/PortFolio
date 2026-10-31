import { useEffect, useRef } from "react";
import gsap from "gsap";
import { prefersReducedMotion } from "./utils/lenis";
import "./styles/Ticker.css";

const WORDS: { t: string; serif?: boolean }[] = [
  { t: "LLM agents" },
  { t: "RAG pipelines", serif: true },
  { t: "Ruby on Rails" },
  { t: "Spring Boot APIs", serif: true },
  { t: "React front-ends" },
  { t: "Evals & guardrails", serif: true },
];

const Run = ({ hidden }: { hidden?: boolean }) => (
  <span className="ticker-run" aria-hidden={hidden || undefined}>
    {WORDS.map((w) => (
      <span className="ticker-item" key={w.t}>
        <span className={w.serif ? "ticker-word serif" : "ticker-word"}>{w.t}</span>
        <svg className="ticker-star" viewBox="0 0 100 100" aria-hidden="true">
          <path d="M50 2 C54 34 66 46 98 50 C66 54 54 66 50 98 C46 66 34 54 2 50 C34 46 46 34 50 2Z" />
        </svg>
      </span>
    ))}
  </span>
);

/**
 * A slow band of what I build. Drifts on its own, speeds up with scroll
 * and follows the scroll direction. Paused while off screen.
 */
const Ticker = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track || prefersReducedMotion()) return;

    let x = 0;
    let dir = -1;
    let boost = 0;
    let last = window.scrollY;
    let running = false;

    const tick = (_t: number, dt: number) => {
      const y = window.scrollY;
      const v = y - last;
      last = y;
      if (v !== 0) dir = v > 0 ? -1 : 1;
      boost += (Math.min(Math.abs(v), 60) * 0.12 - boost) * 0.12;
      const half = track.scrollWidth / 2;
      x += dir * (0.04 + boost * 0.02) * dt;
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      track.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
      root.style.setProperty("--skew", `${(-dir * boost * 0.9).toFixed(2)}deg`);
    };

    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !running) {
        last = window.scrollY;
        gsap.ticker.add(tick);
        running = true;
      } else if (!e.isIntersecting && running) {
        gsap.ticker.remove(tick);
        running = false;
      }
    });
    io.observe(root);
    return () => {
      io.disconnect();
      gsap.ticker.remove(tick);
    };
  }, []);

  return (
    <div className="ticker" ref={rootRef} role="presentation">
      <div className="ticker-track" ref={trackRef}>
        <Run />
        <Run hidden />
      </div>
    </div>
  );
};

export default Ticker;
