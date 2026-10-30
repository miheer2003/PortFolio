import { useEffect, useRef } from "react";
import gsap from "gsap";
import "./styles/Loading.css";
import { prefersReducedMotion } from "./utils/lenis";

const SESSION_KEY = "mj-visited";
const FIRST_VISIT = !sessionStorage.getItem(SESSION_KEY);
const WORDS = ["Engineer", "Builder", "AI Engineer", "Miheer"];
const COLS = 6;
// trailing 0 lets a wheel roll 9 -> 0 without jumping back
const DIGITS = [..."01234567890"];

const waitForReady = () =>
  Promise.all([
    document.fonts?.ready ?? Promise.resolve(),
    document.readyState === "complete"
      ? Promise.resolve()
      : new Promise<void>((r) => window.addEventListener("load", () => r(), { once: true })),
  ]);

/** One rolling digit column. */
const Wheel = ({ hundreds }: { hundreds?: boolean }) => (
  <span className="odo-wheel">
    <span className="odo-strip">
      {(hundreds ? ["0", "1"] : DIGITS).map((d, i) => (
        <span key={i}>{d}</span>
      ))}
    </span>
  </span>
);

const Loading = ({ onDone }: { onDone: () => void }) => {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    sessionStorage.setItem(SESSION_KEY, "1");
    const quick = !FIRST_VISIT || prefersReducedMotion();
    let cancelled = false;

    const ctx = gsap.context(() => {
      const [hun, ten, one] = gsap.utils.toArray<HTMLElement>(".odo-strip", root);
      const counter = { v: 0 };
      const setDigits = () => {
        const v = counter.v;
        // odometer: a wheel only turns while the wheel to its right rolls 9 -> 0
        const ones = v % 10;
        const carry = Math.max(0, ones - 9);
        const tens = (Math.floor(v / 10) % 10) + carry;
        const hundreds = Math.min(1, Math.max(0, v - 99));
        gsap.set(one, { yPercent: -(ones / 11) * 100 });
        gsap.set(ten, { yPercent: -(tens / 11) * 100 });
        gsap.set(hun, { yPercent: -(hundreds / 2) * 100 });
      };
      setDigits();

      // intro
      gsap.from(".loader-row > *", { yPercent: 120, duration: 1.1, ease: "expo.out", stagger: 0.06 });

      // word cycle
      // word cycle: plays once and lands on the name
      const words = gsap.utils.toArray<HTMLElement>(".loader-word", root);
      gsap.set(words, { yPercent: (i) => (i === 0 ? 0 : 130) });
      const wordTl = gsap.timeline({ paused: quick });
      words.forEach((w, i) => {
        if (i === words.length - 1) return;
        wordTl
          .to(w, { yPercent: -130, duration: 0.55, ease: "expo.inOut" }, i * 0.6 + 0.45)
          .to(words[i + 1], { yPercent: 0, duration: 0.55, ease: "expo.inOut" }, "<");
      });

      const fill = gsap.to(counter, {
        v: 86,
        duration: quick ? 0.45 : 1.9,
        ease: "power2.inOut",
        onUpdate: setDigits,
      });
      gsap.to(".loader-bar-fill", { scaleX: 0.86, duration: quick ? 0.45 : 1.9, ease: "power2.inOut" });

      const minTime = new Promise((r) => setTimeout(r, quick ? 450 : 2300));
      Promise.all([waitForReady(), minTime]).then(async () => {
        if (cancelled) return;
        const { initialFX } = await import("./utils/initialFX");
        if (cancelled) return;
        fill.kill();
        ctx.add(() => {
          wordTl.kill();
          const last = words[words.length - 1];
          const shown = words.filter((w) => { const y = Number(gsap.getProperty(w, "yPercent")); return w !== last && y > -129 && y < 129; });
          const tl = gsap.timeline({ onComplete: onDone });
          tl.to(counter, { v: 100, duration: 0.5, ease: "power2.out", onUpdate: setDigits })
            .to(".loader-bar-fill", { scaleX: 1, duration: 0.5, ease: "power2.out" }, "<")
            .to(shown, { yPercent: -130, duration: 0.5, ease: "expo.inOut" }, "<")
            .to(last, { yPercent: 0, duration: 0.5, ease: "expo.inOut" }, "<")
            .to(".loader-row > *", { yPercent: -120, duration: 0.7, ease: "expo.in", stagger: 0.04 }, "+=0.25")
            .to(".loader-bar", { scaleX: 0, transformOrigin: "right center", duration: 0.6, ease: "expo.in" }, "<")
            .to(".loader-col", { yPercent: -100, duration: 1.1, ease: "expo.inOut", stagger: { each: 0.06, from: "center" } }, "-=0.2")
            .add(() => {
              // escape this context so loader cleanup can't revert the hero entrance
              window.setTimeout(initialFX, 0);
            }, "-=0.85");
        });
      });
    }, root);

    return () => {
      cancelled = true;
      ctx.revert();
    };
  }, [onDone]);

  return (
    <div className="loader" ref={rootRef} aria-live="polite" aria-label="Loading">
      <div className="loader-cols" aria-hidden="true">
        {Array.from({ length: COLS }, (_, i) => (
          <span className="loader-col" key={i} />
        ))}
      </div>

      <div className="loader-inner">
        <div className="loader-top mono">
          <span className="loader-row">
            <span>Miheer Jangale</span>
          </span>
          <span className="loader-row">
            <span>Portfolio ©{new Date().getFullYear()}</span>
          </span>
        </div>

        <div className="loader-center">
          <div className="loader-row loader-words">
            <span className="loader-words-in">
              {WORDS.map((w, i) => (
                <span className={`loader-word ${i === WORDS.length - 1 ? "is-last" : ""}`} key={w}>
                  {i === WORDS.length - 1 ? (
                    <>
                      {w}
                      <span className="loader-dot">.</span>
                    </>
                  ) : (
                    <span className="serif">{w}</span>
                  )}
                </span>
              ))}
            </span>
          </div>
        </div>

        <div className="loader-bottom">
          <div className="loader-row loader-odo" aria-hidden="true">
            <span>
              <Wheel hundreds />
              <Wheel />
              <Wheel />
              <span className="odo-pct">%</span>
            </span>
          </div>
          <div className="loader-bar">
            <div className="loader-bar-fill" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
