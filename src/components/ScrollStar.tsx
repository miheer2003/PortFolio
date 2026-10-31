import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useLoading } from "../context/LoadingProvider";
import { prefersReducedMotion } from "./utils/lenis";
import "./styles/ScrollStar.css";

/**
 * A glossy four-point star that travels down the page with the scroll.
 *
 * Sections mark resting spots with <StarDock />. While a dock is near the
 * middle of the screen the star sits in it (and scrolls with the content);
 * between docks it glides from one to the next along a soft arc, spinning
 * and resizing to fit the next dock.
 */

const BASE = 64; // rendered size in px; scaled to each dock's size
const FOCUS = 0.45; // dock is "home" when it sits at 45% of the viewport

const Dock = () => <span className="star-dock" data-star-dock aria-hidden="true" />;

/** A resting spot for the star. Wrap a word to keep the spot on its line. */
export const StarDock = ({ before, after }: { before?: React.ReactNode; after?: React.ReactNode }) =>
  before || after ? (
    <span className="star-wrap">
      {before}
      <Dock />
      {after}
    </span>
  ) : (
    <Dock />
  );

const ease = (t: number) => {
  // Dwell near each dock, then glide.
  const k = Math.min(1, Math.max(0, (t - 0.12) / 0.76));
  return k * k * (3 - 2 * k);
};

const ScrollStar = () => {
  const { isLoading } = useLoading();
  const starRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const star = starRef.current;
    if (!star || isLoading || prefersReducedMotion()) return;

    const cur = { x: 0, y: 0, s: 1, r: 0 };
    let first = true;
    let lastScroll = window.scrollY;
    let spin = 0;

    const tick = () => {
      const docks = [...document.querySelectorAll<HTMLElement>("[data-star-dock]")]
        .map((el) => el.getBoundingClientRect())
        .filter((r) => r.width > 0);
      if (!docks.length) return;

      const sy = window.scrollY;
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      // Dock centres in document coordinates.
      const pts = docks.map((r) => ({
        x: r.left + r.width / 2,
        y: r.top + r.height / 2 + sy,
        s: r.width / BASE,
      }));
      const home = pts.map((p) => p.y - vh * FOCUS); // scroll at which each dock is home

      let tx: number;
      let ty: number;
      let ts: number;
      let arc = 0;
      let i = home.findIndex((h) => h > sy);
      if (i === 0) {
        ({ x: tx, y: ty, s: ts } = pts[0]);
      } else if (i === -1) {
        ({ x: tx, y: ty, s: ts } = pts[pts.length - 1]);
      } else {
        i -= 1;
        const a = pts[i];
        const b = pts[i + 1];
        const e = ease((sy - home[i]) / (home[i + 1] - home[i] || 1));
        tx = a.x + (b.x - a.x) * e;
        ty = a.y + (b.y - a.y) * e;
        ts = a.s + (b.s - a.s) * e;
        // Swing out toward the roomier side of the screen on the way.
        const dir = (a.x + b.x) / 2 > vw / 2 ? -1 : 1;
        arc = Math.sin(Math.PI * e) * Math.min(180, vw * 0.16) * dir;
        tx += arc;
        ts *= 1 + Math.sin(Math.PI * e) * 0.25;
      }
      ty -= sy; // to viewport coordinates

      const v = sy - lastScroll;
      lastScroll = sy;
      spin += v * 0.35 + 0.15;

      const k = first ? 1 : 0.16;
      first = false;
      cur.x += (tx - cur.x) * k;
      cur.y += (ty - cur.y) * k;
      cur.s += (ts - cur.s) * k;
      cur.r += (spin - cur.r) * 0.1;

      star.style.transform = `translate3d(${cur.x - BASE / 2}px, ${cur.y - BASE / 2}px, 0) scale(${cur.s.toFixed(3)})`;
      star.style.setProperty("--spin", `${cur.r.toFixed(1)}deg`);
      star.style.setProperty("--tilt", `${Math.max(-40, Math.min(40, v * 1.2)).toFixed(1)}deg`);
    };

    gsap.ticker.add(tick);
    star.classList.add("is-on");
    return () => {
      gsap.ticker.remove(tick);
      star.classList.remove("is-on");
    };
  }, [isLoading]);

  return (
    <div className="scroll-star" ref={starRef} aria-hidden="true">
      <svg className="scroll-star-ring" viewBox="0 0 100 100">
        <ellipse cx="50" cy="50" rx="47" ry="17" />
      </svg>
      <svg className="scroll-star-body" viewBox="0 0 100 100">
        <defs>
          <radialGradient id="ss-fill" cx="0.36" cy="0.3" r="0.8">
            <stop offset="0" stopColor="#fffaf0" />
            <stop offset="0.3" stopColor="#ecd2b2" />
            <stop offset="0.7" stopColor="#a47864" />
            <stop offset="1" stopColor="#5c1726" />
          </radialGradient>
          <linearGradient id="ss-edge" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff8e7" />
            <stop offset="1" stopColor="#5c1726" />
          </linearGradient>
        </defs>
        <path
          d="M50 2 C54 34 66 46 98 50 C66 54 54 66 50 98 C46 66 34 54 2 50 C34 46 46 34 50 2Z"
          fill="url(#ss-fill)"
          stroke="url(#ss-edge)"
          strokeWidth="1.2"
        />
        <path d="M50 12 C52 34 58 42 70 46 C58 44 52 38 50 12Z" fill="#fff" opacity="0.7" />
      </svg>
    </div>
  );
};

export default ScrollStar;
