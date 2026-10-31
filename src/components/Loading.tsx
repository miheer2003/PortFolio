import { useEffect, useRef } from "react";
import gsap from "gsap";
import "./styles/Loading.css";
import StarGlyph from "./StarGlyph";
import { prefersReducedMotion } from "./utils/lenis";
import { STAR_HANDOFF } from "./utils/star";

const SESSION_KEY = "mj-visited";
const FIRST_VISIT = (() => {
  try {
    return !sessionStorage.getItem(SESSION_KEY);
  } catch {
    return true;
  }
})();
const WORDS = ["Engineer", "Builder", "AI Engineer", "Miheer"];
const LAST = WORDS.length - 1;
const SLATS = 8;
const STATUS = ["Booting up", "Indexing projects", "Warming up the models", "Brewing coffee"];
const STEPS = [7, 18, 26, 34, 47, 58, 63, 71, 79, 86]; // until the page is ready
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/+*#";
const BASE = 64; // star box, same as ScrollStar

const sleep = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

const waitForReady = () =>
  Promise.all([
    document.fonts?.ready ?? Promise.resolve(),
    document.readyState === "complete"
      ? Promise.resolve()
      : new Promise<void>((r) => window.addEventListener("load", () => r(), { once: true })),
  ]);

/** The hero lives in a lazy chunk; don't open the blinds onto an empty page. */
const waitForHero = async (maxMs: number) => {
  const t0 = performance.now();
  while (!document.querySelector(".hero-name") && performance.now() - t0 < maxMs) await sleep(80);
};

/** One split-flap digit: static halves plus a falling top and a rising bottom. */
const Flap = () => (
  <span className="flap" data-v="0">
    <span className="flap-half flap-top">
      <b>0</b>
    </span>
    <span className="flap-half flap-bot">
      <b>0</b>
    </span>
    <span className="flap-half flap-top flap-fall">
      <b>0</b>
    </span>
    <span className="flap-half flap-bot flap-rise">
      <b>0</b>
    </span>
  </span>
);

const flip = (flap: HTMLElement, to: string, still: boolean) => {
  const from = flap.dataset.v ?? "0";
  if (from === to) return;
  flap.dataset.v = to;
  const [top, bot, fall, rise] = Array.from(flap.children) as HTMLElement[];
  const set = (el: HTMLElement, v: string) => ((el.firstElementChild as HTMLElement).textContent = v);
  set(top, to);
  set(bot, from);
  set(fall, from);
  set(rise, to);
  if (still || typeof fall.animate !== "function") {
    set(bot, to);
    fall.style.transform = "rotateX(-90deg)";
    rise.style.transform = "none";
    return;
  }
  // The top leaf falls toward you, then the bottom leaf lands with a small bounce.
  fall.animate([{ transform: "rotateX(0deg)" }, { transform: "rotateX(-90deg)" }], {
    duration: 170,
    easing: "cubic-bezier(.55,0,.85,.35)",
    fill: "forwards",
  });
  rise.animate(
    [{ transform: "rotateX(90deg)" }, { transform: "rotateX(-10deg)", offset: 0.72 }, { transform: "rotateX(0deg)" }],
    { duration: 260, delay: 160, easing: "cubic-bezier(.25,.8,.35,1)", fill: "both" }
  );
};

/** Decode-style text swap: random glyphs settle into the text from left to right. */
const scramble = (el: HTMLElement, text: string, ms: number, still: boolean) => {
  if (still) {
    el.textContent = text;
    return () => {};
  }
  const t0 = performance.now();
  let raf = 0;
  const step = (now: number) => {
    const k = Math.min(1, (now - t0) / ms);
    const n = Math.floor(text.length * k);
    let out = text.slice(0, n);
    for (let i = n; i < text.length; i++) out += text[i] === " " ? " " : GLYPHS[(Math.random() * GLYPHS.length) | 0];
    el.textContent = out;
    if (k < 1) raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
  return () => cancelAnimationFrame(raf);
};

const Loading = ({ onDone }: { onDone: () => void }) => {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* private mode */
    }
    const still = prefersReducedMotion();
    const quick = !FIRST_VISIT || still;
    let cancelled = false;
    const timers: number[] = [];
    const later = (ms: number, fn: () => void) =>
      timers.push(window.setTimeout(() => !cancelled && fn(), ms));
    const $ = (s: string) => root.querySelector<HTMLElement>(s) as HTMLElement;
    const fx = import("./utils/initialFX");

    const drum = $(".ld-drum");
    const flaps = Array.from(root.querySelectorAll<HTMLElement>(".flap"));
    const fill = $(".ld-bar-fill");
    const statusI = $(".ld-status-i");
    const statusT = $(".ld-status-t");

    // ---- counter
    const show = (v: number) => {
      const s = String(v).padStart(3, "0");
      flaps.forEach((f, i) => flip(f, s[i], still));
      fill.style.transform = `scaleX(${v / 100})`;
    };
    // ---- status line
    let stopScramble = () => {};
    const say = (i: number, text: string) => {
      statusI.textContent = String(i).padStart(2, "0");
      stopScramble();
      stopScramble = scramble(statusT, text, 420, still);
    };
    // ---- word drum (face i is in front at rotateX(i * 90deg))
    let face = -1;
    const turn = (to: number) => {
      face = to;
      drum.style.transform = `rotateX(${to * 90}deg)`;
    };

    if (still) {
      drum.style.transition = "none";
      turn(LAST);
      show(86);
      say(1, "Loading");
    } else if (quick) {
      drum.style.transform = "rotateX(180deg)";
      requestAnimationFrame(() => requestAnimationFrame(() => !cancelled && turn(LAST)));
      say(1, "Welcome back");
      later(80, () => show(48));
      later(260, () => show(86));
    } else {
      requestAnimationFrame(() => requestAnimationFrame(() => !cancelled && turn(0)));
      [450, 1050, 1650].forEach((t, i) => later(t, () => turn(i + 1)));
      STATUS.forEach((s, i) => later(i === 0 ? 0 : 120 + i * 560, () => say(i + 1, s)));
      STEPS.forEach((v, i) => later(160 + i * 205, () => show(v)));
    }

    // ---- pointer tilt (laptops)
    const scene = $(".ld-scene");
    let offPointer = () => {};
    if (!still && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      const rx = gsap.quickTo(scene, "rotationX", { duration: 0.9, ease: "power3.out" });
      const ry = gsap.quickTo(scene, "rotationY", { duration: 0.9, ease: "power3.out" });
      const move = (e: PointerEvent) => {
        ry((e.clientX / window.innerWidth - 0.5) * 26);
        rx((0.5 - e.clientY / window.innerHeight) * 16);
      };
      window.addEventListener("pointermove", move, { passive: true });
      offPointer = () => window.removeEventListener("pointermove", move);
    }

    // ---- the star leaves its orbit and flies into the hero, where ScrollStar takes over
    const fly = (ms: number) => {
      const dock = document.querySelector<HTMLElement>(".hero-photo .star-dock");
      const orbiter = $(".ld-bill");
      const flyer = $(".ld-fly");
      const d = dock?.getBoundingClientRect();
      const o = orbiter.getBoundingClientRect();
      if (!d?.width || !o.width || typeof flyer.animate !== "function") {
        orbiter.animate?.([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: "forwards" });
        return Promise.resolve();
      }
      const p0 = { x: o.left + o.width / 2, y: o.top + o.height / 2, s: o.width / BASE };
      const p2 = { x: d.left + d.width / 2, y: d.top + d.height / 2, s: d.width / BASE };
      const side = p2.x >= p0.x ? -1 : 1;
      const p1 = {
        x: (p0.x + p2.x) / 2 + side * window.innerWidth * 0.2,
        y: Math.min(p0.y, p2.y) - window.innerHeight * 0.3,
      };
      const frames: Keyframe[] = [];
      for (let k = 0; k <= 20; k++) {
        const t = k / 20;
        const u = 1 - t;
        const x = u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x;
        const y = u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y;
        const s = (p0.s + (p2.s - p0.s) * t) * (1 + Math.sin(Math.PI * t) * 0.9);
        frames.push({ transform: `translate3d(${x - BASE / 2}px, ${y - BASE / 2}px, 0) scale(${s.toFixed(3)})`, offset: t });
      }
      const r0 = parseFloat(getComputedStyle(orbiter.querySelector(".sg-body") as Element).rotate) || 0;
      const r1 = Math.ceil((r0 + 540) / 90) * 90; // lands square, like ScrollStar at rest
      const timing: KeyframeAnimationOptions = { duration: ms, easing: "cubic-bezier(.62,0,.22,1)", fill: "forwards" };
      const spin = (el: Element | null, delay = 0) =>
        el?.animate([{ transform: `rotate(${r0}deg)` }, { transform: `rotate(${r1}deg)` }], { ...timing, delay, fill: "both" });

      orbiter.style.visibility = "hidden";
      const ghosts = Array.from(root.querySelectorAll<HTMLElement>(".ld-ghost"));
      [flyer, ...ghosts].forEach((el) => (el.style.visibility = "visible"));
      const main = flyer.animate(frames, timing);
      spin(flyer.querySelector(".sg-body"));
      flyer
        .querySelector(".sg-ring")
        ?.animate([{ transform: "rotate(-18deg) scale(1.25)" }, { transform: "rotate(342deg) scale(1.25)" }], timing);
      ghosts.forEach((g, i) => {
        // fill "both": hold the start pose during the delay instead of sitting at 0,0
        g.animate(frames, { ...timing, delay: 50 * (i + 1), fill: "both" });
        spin(g.querySelector(".sg-body"), 50 * (i + 1));
      });
      return main.finished
        .then(() => {
          if (cancelled) return;
          window.dispatchEvent(new Event(STAR_HANDOFF));
          [flyer, ...ghosts].forEach((el) => (el.style.visibility = "hidden"));
        })
        .catch(() => {});
    };

    const openBlinds = (ms: number, gap: number) => {
      const slats = Array.from(root.querySelectorAll<HTMLElement>(".ld-slat"));
      const mid = (slats.length - 1) / 2;
      const done = slats.map((s, i) => {
        const delay = Math.abs(i - mid) * gap;
        const timing: KeyframeAnimationOptions = { duration: ms, delay, easing: "cubic-bezier(.65,0,.3,1)", fill: "forwards" };
        (s.firstElementChild as HTMLElement).animate(
          [{ opacity: 0 }, { opacity: 0.32, offset: 0.6 }, { opacity: 0.18 }],
          timing
        );
        return s.animate(
          [
            { transform: "rotateX(0deg)", opacity: 1 },
            { transform: "rotateX(60deg)", opacity: 1, offset: 0.58 },
            { transform: "rotateX(90deg)", opacity: 0 },
          ],
          timing
        ).finished;
      });
      return Promise.all(done);
    };

    const exit = async () => {
      const { initialFX } = await fx;
      if (cancelled) return;

      if (still) {
        show(100);
        say(2, "Ready");
        initialFX();
        await root.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400, fill: "forwards" }).finished;
        if (!cancelled) onDone();
        return;
      }

      show(100);
      say(quick ? 2 : STATUS.length + 1, "Ready");
      if (face !== LAST) turn(LAST);
      await sleep(quick ? 180 : 420);
      if (cancelled) return;

      // The word rushes past the camera while the rest of the scene fades.
      $(".ld-drum-wrap").animate([{ transform: "translateZ(0)" }, { transform: "translateZ(420px)" }], {
        duration: 700,
        easing: "cubic-bezier(.6,0,.9,.45)",
        fill: "forwards",
      });
      $(".ld-stage").animate([{ opacity: 1 }, { opacity: 0 }], { duration: 560, delay: 80, easing: "ease-in", fill: "forwards" });
      $(".ld-glow").animate([{ opacity: 1 }, { opacity: 0 }], { duration: 700, fill: "forwards" });
      root.querySelectorAll<HTMLElement>(".ld-ui .ld-row > *, .ld-flaps, .ld-bar").forEach((el, i) =>
        el.animate([{ transform: "none", opacity: 1 }, { transform: "translateY(-60%)", opacity: 0 }], {
          duration: 520,
          delay: i * 30,
          easing: "cubic-bezier(.7,0,.84,0)",
          fill: "forwards",
        })
      );
      const landed = fly(quick ? 820 : 1080);
      await sleep(quick ? 260 : 460);
      if (cancelled) return;
      const opened = openBlinds(quick ? 820 : 1000, quick ? 45 : 70);
      later(120, initialFX);
      await Promise.all([landed, opened]);
      if (!cancelled) onDone();
    };

    Promise.all([waitForReady(), sleep(quick ? 450 : 2300)])
      .then(() => waitForHero(8000))
      .then(() => {
        if (!cancelled) void exit();
      });

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      stopScramble();
      offPointer();
      gsap.killTweensOf(scene);
    };
  }, [onDone]);

  return (
    <div className="loader" ref={rootRef} role="status" aria-label="Loading">
      <div className="ld-blinds" aria-hidden="true">
        {Array.from({ length: SLATS }, (_, i) => (
          <span className="ld-slat" key={i}>
            <i />
          </span>
        ))}
      </div>
      <div className="ld-glow" aria-hidden="true" />

      <div className="ld-stage" aria-hidden="true">
        <div className="ld-scene">
          <div className="ld-sway">
            <div className="ld-drum-wrap">
              <div className="ld-drum">
                {WORDS.map((w, i) => (
                  <span className="ld-face" key={w} style={{ "--i": i } as React.CSSProperties}>
                    {i === LAST ? (
                      <>
                        {w}
                        <span className="ld-dot">.</span>
                      </>
                    ) : (
                      <span className="serif">{w}</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
            <div className="ld-orbit ld-orbit-a">
              <span className="ld-ring" />
              <span className="ld-spin">
                <span className="ld-arm">
                  <span className="ld-unspin">
                    <span className="ld-bill">
                      <StarGlyph id="ld-o" />
                    </span>
                  </span>
                </span>
              </span>
            </div>
            <div className="ld-orbit ld-orbit-b">
              <span className="ld-ring" />
            </div>
          </div>
        </div>
      </div>

      <div className="ld-ui" aria-hidden="true">
        <div className="ld-top mono">
          <span className="ld-row">
            <span>Miheer Jangale</span>
          </span>
          <span className="ld-row">
            <span>Portfolio ©{new Date().getFullYear()}</span>
          </span>
        </div>
        <div className="ld-bottom">
          <div className="ld-meter">
            <span className="ld-flaps">
              <Flap />
              <Flap />
              <Flap />
              <span className="ld-pct">%</span>
            </span>
            <span className="ld-row ld-status mono">
              <span>
                <span className="ld-status-i">01</span>
                <span className="ld-status-t" />
                <span className="ld-caret" />
              </span>
            </span>
          </div>
          <div className="ld-bar">
            <span className="ld-bar-fill" />
          </div>
        </div>
      </div>

      <div className="ld-fly" aria-hidden="true">
        <StarGlyph id="ld-f" />
      </div>
      <div className="ld-ghost" aria-hidden="true">
        <StarGlyph id="ld-g1" ring={false} />
      </div>
      <div className="ld-ghost" aria-hidden="true">
        <StarGlyph id="ld-g2" ring={false} />
      </div>
    </div>
  );
};

export default Loading;
