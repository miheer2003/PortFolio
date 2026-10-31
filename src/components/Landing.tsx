import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { MdArrowOutward, MdArrowDownward } from "react-icons/md";
import "./styles/Landing.css";
import TimeWidgets from "./TimeWidgets";
import { prefersReducedMotion, scrollToTarget } from "./utils/lenis";
import { StarDock } from "./ScrollStar";

gsap.registerPlugin(useGSAP);

const HeroPortrait = lazy(() => import("./HeroPortrait"));
const PORTRAIT = `${import.meta.env.BASE_URL}images/miheer-portrait.jpg`;

const formatTime = () =>
  new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  }).format(new Date());

// eslint-disable-next-line react-refresh/only-export-components
export const useLocalTime = () => {
  const [time, setTime] = useState(formatTime);
  useEffect(() => {
    const id = setInterval(() => setTime(formatTime()), 15_000);
    return () => clearInterval(id);
  }, []);
  return time;
};

const Chars = ({ text }: { text: string }) => (
  <>
    {[...text].map((c, i) => (
      <span className="hero-char" key={i} aria-hidden="true">
        {c}
      </span>
    ))}
  </>
);

const W_MIN = 360;
const W_MAX = 720;

const Landing = () => {
  const rootRef = useRef<HTMLElement>(null);
  const time = useLocalTime();
  const [webgl, setWebgl] = useState(false);
  const onReady = useCallback(() => setWebgl(true), []);
  const motion = !prefersReducedMotion();

  useGSAP(
    () => {
      if (!motion) return;
      const root = rootRef.current!;

      // Scroll: name drifts, content fades.
      gsap.to(".hero-name", {
        yPercent: -14,
        ease: "none",
        scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(".hero-inner", {
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: root, start: "45% top", end: "bottom top", scrub: true },
      });

      const chars = gsap.utils.toArray<HTMLElement>(".hero-char", root);
      const wTo = chars.map((c) => gsap.quickTo(c, "fontWeight", { duration: 0.7, ease: "power3.out" }));
      const yTo = chars.map((c) => gsap.quickTo(c, "y", { duration: 0.7, ease: "power3.out" }));
      const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

      if (fine) {
        // Variable-weight proximity: letters near the cursor thicken and lift.
        const onMove = (e: PointerEvent) => {
          const radius = Math.max(260, window.innerWidth * 0.22);
          chars.forEach((c, i) => {
            const r = c.getBoundingClientRect();
            const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
            const t = Math.max(0, 1 - d / radius);
            const k = t * t * (3 - 2 * t);
            wTo[i](W_MIN + (W_MAX - W_MIN) * k);
            yTo[i](-r.height * 0.05 * k);
          });
        };
        const onLeave = () => chars.forEach((_, i) => (wTo[i](W_MIN), yTo[i](0)));
        window.addEventListener("pointermove", onMove);
        document.documentElement.addEventListener("pointerleave", onLeave);
        return () => {
          window.removeEventListener("pointermove", onMove);
          document.documentElement.removeEventListener("pointerleave", onLeave);
        };
      }

      // Touch: a slow weight wave rolls through the name while the hero is visible.
      const wave = (time: number) => {
        if (window.scrollY > window.innerHeight) return;
        chars.forEach((c, i) => {
          const s = 0.5 + 0.5 * Math.sin(time * 1.4 - i * 0.55);
          c.style.fontWeight = String(Math.round(W_MIN + (W_MAX - W_MIN) * s * s * s));
        });
      };
      gsap.ticker.add(wave);
      return () => gsap.ticker.remove(wave);
    },
    { scope: rootRef }
  );

  return (
    <section className="hero" id="top" ref={rootRef}>
      <div className="hero-glow" aria-hidden="true">
        <span className="glow glow-cream" />
        <span className="glow glow-wine" />
      </div>

      <div className="wrap hero-inner">
        <div className="hero-meta mono">
          <span data-hero-fade>Software &amp; AI Engineer</span>
          <span data-hero-fade>Pune, India</span>
          <span data-hero-fade className="hero-time">
            Local time {time} IST
          </span>
        </div>

        <div className="hero-stage">
          <h1 className="hero-name" aria-label="Miheer Jangale">
            <span className="hero-line hero-line-1">
              <Chars text="Miheer" />
            </span>{" "}
            <span className="hero-line hero-line-2">
              <Chars text="Jangale" />
              <span className="hero-char hero-dot" aria-hidden="true">
                .
              </span>
            </span>
          </h1>

          <figure className={`hero-photo ${webgl ? "is-webgl" : ""}`}>
            <StarDock />
            <img
              className="hero-photo-img"
              src={PORTRAIT}
              alt="Portrait of Miheer Jangale"
              width={848}
              height={1060}
              {...{ fetchpriority: "high" }}
            />
            {motion && (
              <Suspense fallback={null}>
                <HeroPortrait src={PORTRAIT} onReady={onReady} />
              </Suspense>
            )}
          </figure>

          <TimeWidgets />
        </div>

        <div className="hero-foot">
          <p className="hero-lead" data-hero-fade>
            I build intelligent software, from full-stack products in{" "}
            <span className="hero-em">Rails &amp; React</span> to{" "}
            <span className="serif hero-serif">LLM-powered</span> systems that ship.
          </p>

          <div className="hero-side">
            <div className="hero-status mono" data-hero-fade>
              <span className="live-dot" />
              <span>
                Currently AI Engineer at{" "}
                <a
                  href="https://nutsovertech.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-line hero-company"
                >
                  Nutsovertech
                </a>
              </span>
            </div>
            <div className="hero-actions" data-hero-fade>
              <a
                href="#work"
                className="btn btn-solid"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToTarget("#work");
                }}
              >
                View work <MdArrowDownward />
              </a>
              <a
                href="#contact"
                className="btn"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToTarget("#contact");
                }}
              >
                Get in touch <MdArrowOutward />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Landing;
