import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { MdArrowOutward, MdArrowUpward } from "react-icons/md";
import "./styles/Contact.css";
import CoffeeButton from "./CoffeeButton";
import { useLocalTime } from "./Landing";
import { prefersReducedMotion, scrollToTarget } from "./utils/lenis";
import { StarDock } from "./ScrollStar";

const EMAIL = "miheerjangale7@gmail.com";

const SOCIALS = [
  { label: "GitHub", href: "https://github.com/miheer2003" },
  { label: "LinkedIn", href: "https://linkedin.com/in/miheer-jangale" },
  {
    label: "Résumé",
    href: "https://drive.google.com/file/d/1qq9yPUU2tygYuroMppPYi_-x5V9dt0Oe/view?usp=sharing",
  },
];

const WORD = "intelligent.";
const TITLE = `Let's build something ${WORD}`;

type Ch = { rx: number; ry: number; z: number; y: number; last: string };

/**
 * The letters of "intelligent." turn in 3D to face the cursor (laptops) and ripple
 * with scroll speed (everywhere). SplitText re-splits the title on resize, so the
 * letters are looked up again whenever the old nodes leave the DOM.
 */
const useLetters = (titleRef: React.RefObject<HTMLHeadingElement>) => {
  useEffect(() => {
    const title = titleRef.current;
    const section = title?.closest("section");
    if (!title || !section || prefersReducedMotion()) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    let word: HTMLElement | null = null;
    let letters: HTMLElement[] = [];
    let rel: { x: number; y: number }[] = [];
    let st: Ch[] = [];
    const collect = () => {
      word =
        Array.from(title.querySelectorAll<HTMLElement>(".contact-word")).find((w) => w.querySelector(".tl-ch")) ??
        null;
      letters = word ? Array.from(word.querySelectorAll<HTMLElement>(".tl-ch")) : [];
      // Layout offsets ignore transforms, so these stay valid while letters move.
      rel = letters.map((l) => ({
        x: l.offsetLeft - (word as HTMLElement).offsetLeft + l.offsetWidth / 2,
        y: l.offsetTop - (word as HTMLElement).offsetTop + l.offsetHeight / 2,
      }));
      st = letters.map(() => ({ rx: 0, ry: 0, z: 0, y: 0, last: "" }));
    };

    const ptr = { x: 0, y: 0, in: false };
    let vel = 0;
    let amp = 0;
    let phase = 0;
    let lastY = window.scrollY;

    const tick = () => {
      if (!letters.length || !letters[0].isConnected) collect();
      if (!word || !letters.length) return;
      const sy = window.scrollY;
      vel += (gsap.utils.clamp(-60, 60, sy - lastY) - vel) * 0.2;
      lastY = sy;
      amp += (Math.min(Math.abs(vel) * 0.9, 16) - amp) * 0.08;
      phase += vel * 0.05;

      const wr = word.getBoundingClientRect();
      const fs = wr.height || 100;
      const sigma = fs * 1.4;
      letters.forEach((l, i) => {
        const s = st[i];
        let rx = Math.cos(phase + i * 0.55) * amp * 1.6;
        let ry = 0;
        let z = 0;
        const y = Math.sin(phase + i * 0.55) * amp;
        if (fine && ptr.in) {
          const dx = ptr.x - (wr.left + rel[i].x);
          const dy = ptr.y - (wr.top + rel[i].y);
          const f = Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma));
          const k = 0.35 + 0.65 * f;
          ry += gsap.utils.clamp(-1, 1, dx / sigma) * 42 * k;
          rx += gsap.utils.clamp(-1, 1, -dy / sigma) * 34 * k;
          z = f * fs * 0.42;
        }
        s.rx += (rx - s.rx) * 0.14;
        s.ry += (ry - s.ry) * 0.14;
        s.z += (z - s.z) * 0.14;
        s.y += (y - s.y) * 0.14;
        const still = Math.abs(s.rx) + Math.abs(s.ry) + Math.abs(s.z) + Math.abs(s.y) < 0.05;
        const t = still
          ? ""
          : `perspective(${Math.round(fs * 7)}px) translate3d(0,${s.y.toFixed(2)}px,${s.z.toFixed(1)}px) rotateX(${s.rx.toFixed(2)}deg) rotateY(${s.ry.toFixed(2)}deg)`;
        if (t !== s.last) l.style.transform = s.last = t;
      });
    };

    const onMove = (e: PointerEvent) => {
      const r = section.getBoundingClientRect();
      ptr.x = e.clientX;
      ptr.y = e.clientY;
      ptr.in = e.clientY >= r.top && e.clientY <= r.bottom;
    };
    const onOut = () => (ptr.in = false);

    let running = false;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !running) {
        lastY = window.scrollY;
        gsap.ticker.add(tick);
      }
      if (!e.isIntersecting && running) gsap.ticker.remove(tick);
      running = e.isIntersecting;
    });
    io.observe(title);
    const ro = new ResizeObserver(() => (letters = []));
    ro.observe(title);
    if (fine) {
      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onOut);
    }
    return () => {
      io.disconnect();
      ro.disconnect();
      gsap.ticker.remove(tick);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onOut);
      letters.forEach((l) => (l.style.transform = ""));
    };
  }, [titleRef]);
};

const Contact = () => {
  const [copied, setCopied] = useState(false);
  const time = useLocalTime();
  const titleRef = useRef<HTMLHeadingElement>(null);
  useLetters(titleRef);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${EMAIL}`;
    }
  };

  return (
    <section className="section contact" id="contact">
      <div className="contact-glow" aria-hidden="true" />
      <div className="wrap">
        <div className="sec-head">
          <span className="mono sec-index">(07)</span>
          <span className="mono">Contact</span>
          <span className="sec-line" aria-hidden="true" />
        </div>

        <p className="mono contact-kicker" data-reveal="fade">
          <span className="live-dot" /> Open to collaborations &amp; interesting problems
        </p>
        <h2 className="contact-title" data-reveal="lines" ref={titleRef} aria-label={TITLE}>
          Let's build <StarDock before="something" />{" "}
          <span className="serif accent-text contact-word">
            {WORD.split("").map((c, i) => (
              <span key={i} className="tl-ch">
                {c}
              </span>
            ))}
          </span>
        </h2>

        <div className="contact-actions" data-reveal="fade">
          <a href={`mailto:${EMAIL}`} className="contact-email">
            <span>{EMAIL}</span>
            <MdArrowOutward />
          </a>
          <button className="btn" onClick={copy} aria-live="polite">
            {copied ? "Copied ✓" : "Copy email"}
          </button>
          <CoffeeButton />
        </div>

        <div className="contact-grid">
          <div>
            <span className="mono">Phone</span>
            <a href="tel:+918177870012" className="link-line">
              +91 81778 70012
            </a>
          </div>
          <div>
            <span className="mono">Elsewhere</span>
            <ul>
              {SOCIALS.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="link-line">
                    {s.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <span className="mono">Local time</span>
            <span>{time} IST · Pune</span>
          </div>
        </div>

        <footer className="footer">
          <span className="mono">© {new Date().getFullYear()} Miheer Jangale</span>
          <span className="mono">Designed &amp; built by me</span>
          <button className="mono footer-top" onClick={() => scrollToTarget(0)}>
            Back to top <MdArrowUpward />
          </button>
        </footer>
      </div>
    </section>
  );
};

export default Contact;
