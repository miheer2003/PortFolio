import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MdArrowBack, MdArrowForward } from "react-icons/md";
import { FaAws } from "react-icons/fa6";
import { SiInfosys, SiUdemy } from "react-icons/si";
import type { IconType } from "react-icons";
import "./styles/Certifications.css";
import SectionHead from "./SectionHead";
import { getLenis, prefersReducedMotion } from "./utils/lenis";
import { StarDock } from "./ScrollStar";

gsap.registerPlugin(ScrollTrigger);

const img = (name: string) => `${import.meta.env.BASE_URL}images/certifications/${name}`;

type Cert = {
  title: string;
  lead: string;
  accent: string;
  code: string;
  issuer: string;
  year: string;
  image: string;
  description: string;
  badge?: string;
  Icon?: IconType;
};

const CERTS: Cert[] = [
  {
    title: "PG-DAC",
    lead: "Advanced",
    accent: "Computing",
    code: "PG—DAC",
    issuer: "CDAC ACTS, Pune",
    year: "2025",
    image: img("pg-dac.webp"),
    description: "Post Graduate Diploma in Advanced Computing, focused on full-stack development. Secured All India Rank (AIR) 23.",
    badge: "AIR 23",
  },
  {
    title: "AWS Cloud Practitioner",
    lead: "Cloud",
    accent: "Practitioner",
    code: "AWS · CLF",
    Icon: FaAws,
    issuer: "Amazon Web Services",
    year: "2024",
    image: img("aws-cloud-foundations.webp"),
    description: "Foundations of AWS Cloud concepts, security and architecture.",
  },
  {
    title: "AWS Developer Associate",
    lead: "Developer",
    accent: "Associate",
    code: "AWS · DVA",
    Icon: FaAws,
    issuer: "Amazon Web Services",
    year: "2024",
    image: img("aws-developer.jpg"),
    description: "Provisioning, operating and managing distributed applications on AWS.",
  },
  {
    title: "ML with Python",
    lead: "Machine",
    accent: "Learning",
    code: "ML · PY",
    Icon: SiUdemy,
    issuer: "Udemy",
    year: "2023",
    image: img("machine-learning.jpg"),
    description: "Building and deploying machine learning models with Python.",
  },
  {
    title: "Database Management",
    lead: "Database",
    accent: "Systems",
    code: "DBMS",
    Icon: SiInfosys,
    issuer: "Infosys",
    year: "2023",
    image: img("database-management.jpg"),
    description: "Database design, SQL querying and relational database systems.",
  },
  {
    title: "Advanced JavaScript",
    lead: "Advanced",
    accent: "JavaScript",
    code: "JS · ES6+",
    Icon: SiInfosys,
    issuer: "Infosys",
    year: "2023",
    image: img("javascript.jpg"),
    description: "Closures, async programming and modern ES6+ features.",
  },
  {
    title: "Web Dev Bootcamp",
    lead: "Web Dev",
    accent: "Bootcamp",
    code: "WEB · FS",
    Icon: SiUdemy,
    issuer: "Udemy",
    year: "2022",
    image: img("web-dev.jpg"),
    description: "HTML, CSS, JavaScript and backend frameworks.",
  },
];

const N = CERTS.length;
const mod = (a: number) => ((a % N) + N) % N;
/** Offset to the nearest copy of a card on the endless deck, in [-N/2, N/2]. */
const wrapOff = (o: number) => o - N * Math.round(o / N);
const fine = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

type Pose = { x: number; y: number; z: number; rz: number; ry: number; s: number };

/** A hand of cards: each card swings around a pivot far below the deck. */
const FAN = {
  wide: { step: 8.5, pivot: 4.3 },
  narrow: { step: 11, pivot: 3.1 },
};
const fanPose = (o: number, w: number, narrow: boolean): Pose => {
  const { step, pivot } = narrow ? FAN.narrow : FAN.wide;
  const R = w * pivot;
  const a = (o * step * Math.PI) / 180;
  const lift = Math.max(0, 1 - Math.abs(o)); // the top card rises toward you
  return {
    x: Math.sin(a) * R,
    y: (1 - Math.cos(a)) * R - lift * 26,
    z: -Math.abs(o) * 46 + lift * 80,
    rz: o * step,
    ry: -o * 5,
    s: 1,
  };
};
/** Stacked deck before the deal. */
const deckPose = (i: number): Pose => ({
  x: (i - (N - 1) / 2) * 3,
  y: 80 - i * 3,
  z: -140 - i * 3,
  rz: (i % 2 ? 1 : -1) * (2 + i * 0.8),
  ry: 0,
  s: 0.84,
});

/** Stamp for the back of a card: ring text turning around the site's star. */
const Seal = ({ id, year }: { id: number; year: string }) => (
  <svg className="cert-seal" viewBox="0 0 120 120" aria-hidden="true">
    <defs>
      <path id={`seal-path-${id}`} d="M60 60 m-45 0 a45 45 0 1 1 90 0 a45 45 0 1 1 -90 0" />
    </defs>
    <circle className="seal-disc" cx="60" cy="60" r="57" />
    <circle className="seal-line" cx="60" cy="60" r="53" />
    <circle className="seal-line" cx="60" cy="60" r="36" />
    <g className="seal-ring">
      <text>
        <textPath href={`#seal-path-${id}`} textLength="276" lengthAdjust="spacing">
          VERIFIED · PROOF OF PRACTICE · {year} ·
        </textPath>
      </text>
    </g>
    <path
      className="seal-star"
      d="M60 35 C62.4 52.5 67.5 57.6 85 60 C67.5 62.4 62.4 67.5 60 85 C57.6 67.5 52.5 62.4 35 60 C52.5 57.6 57.6 52.5 60 35Z"
    />
  </svg>
);

type Api = { go: (delta: number) => void; goCard: (i: number) => void };

const Certifications = () => {
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const cardsRef = useRef<(HTMLLIElement | null)[]>([]);
  const api = useRef<Api | null>(null);
  const [active, setActive] = useState(0);
  const [flipped, setFlipped] = useState(-1);

  // Moving to another card turns the old one face up again.
  useEffect(() => setFlipped(-1), [active]);

  useEffect(() => {
    const stage = stageRef.current;
    const track = trackRef.current;
    const cards = cardsRef.current.filter(Boolean) as HTMLLIElement[];
    if (!stage || !track || cards.length !== N) return;
    const still = prefersReducedMotion();
    const isFine = fine();

    const S = { pos: 0, w: 300, narrow: false, sway: 0, yaw: 0, tYaw: 0, dirty: true };
    const cur = CERTS.map((_, i) => i); // shown offset of each card (unwrapped), springs toward i - pos
    const vel = CERTS.map(() => 0);
    const deal = CERTS.map(() => ({ v: still ? 1 : 0 }));
    const last = cards.map(() => "");
    let tween: gsap.core.Tween | null = null;

    const measure = () => {
      S.w = cards[0].offsetWidth || 300;
      S.narrow = stage.clientWidth < 700;
      S.dirty = true;
    };
    measure();

    const render = () => {
      for (let i = 0; i < N; i++) {
        const o = wrapOff(cur[i]);
        const f = fanPose(o, S.w, S.narrow);
        const d = deckPose(i);
        const k = deal[i].v;
        const mix = (a: number, b: number) => a + (b - a) * k;
        const swing = S.sway * o * 0.35; // the fan opens and closes with scroll speed
        const t =
          `translate(-50%, -50%) translate3d(${mix(d.x, f.x).toFixed(1)}px, ${mix(d.y, f.y).toFixed(1)}px, ` +
          `${mix(d.z, f.z).toFixed(1)}px) rotateZ(${mix(d.rz, f.rz + swing).toFixed(2)}deg) ` +
          `rotateY(${mix(d.ry, f.ry).toFixed(2)}deg) scale(${mix(d.s, 1).toFixed(3)})`;
        const a = Math.abs(o);
        const op = Math.min(1, Math.max(0, (N / 2 - a) / 0.6)); // hide the wrap at the ends
        const key = `${t}|${op.toFixed(3)}`;
        if (key === last[i]) continue;
        last[i] = key;
        const card = cards[i];
        card.style.transform = t;
        card.style.opacity = op > 0.999 ? "" : op.toFixed(3);
        card.style.pointerEvents = op < 0.3 ? "none" : "";
        card.style.setProperty("--shade", (Math.min(a, 3) * 0.12).toFixed(3));
        card.style.setProperty("--o", o.toFixed(3));
      }
      track.style.transform = `rotateX(${(12 + S.sway * 0.5).toFixed(2)}deg) rotateY(${S.yaw.toFixed(2)}deg)`;
    };

    let shown = -1;
    const tick = (_t: number, dtMs: number) => {
      const dt = Math.min(dtMs, 50) / 1000;
      if (!still) {
        const sw = S.sway + (gsap.utils.clamp(-9, 9, (getLenis()?.velocity ?? 0) * 0.22) - S.sway) * Math.min(1, dt * 6);
        const yw = S.yaw + (S.tYaw - S.yaw) * Math.min(1, dt * 5);
        if (Math.abs(sw - S.sway) > 0.002 || Math.abs(yw - S.yaw) > 0.002) S.dirty = true;
        S.sway = sw;
        S.yaw = yw;
      }
      for (let i = 0; i < N; i++) {
        const target = i - S.pos;
        if (still) {
          if (cur[i] !== target) S.dirty = true;
          cur[i] = target;
          continue;
        }
        // Damped spring; cards further out are softer, so a fast drag bends the fan.
        const k = 170 / (1 + 0.45 * Math.abs(wrapOff(cur[i])));
        const c = 2 * 0.8 * Math.sqrt(k);
        const n = Math.max(1, Math.ceil(dt * 120));
        const h = dt / n;
        for (let s = 0; s < n; s++) {
          vel[i] += (k * (target - cur[i]) - c * vel[i]) * h;
          cur[i] += vel[i] * h;
        }
        if (Math.abs(target - cur[i]) > 0.0005 || Math.abs(vel[i]) > 0.0005) S.dirty = true;
        else {
          cur[i] = target;
          vel[i] = 0;
        }
      }
      const idx = mod(Math.round(S.pos));
      if (idx !== shown) {
        shown = idx;
        setActive(idx);
      }
      if (S.dirty) {
        S.dirty = false;
        render();
      }
    };
    render();

    let running = false;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !running) gsap.ticker.add(tick);
        if (!e.isIntersecting && running) gsap.ticker.remove(tick);
        running = e.isIntersecting;
      },
      { rootMargin: "160px 0px" }
    );
    io.observe(stage);
    const ro = new ResizeObserver(measure);
    ro.observe(stage);

    // Deal the deck when it scrolls into view, left to right.
    const intro = still
      ? null
      : ScrollTrigger.create({
          trigger: stage,
          start: "top 72%",
          once: true,
          onEnter: () =>
            gsap.to(deal, {
              v: 1,
              duration: 1.15,
              ease: "expo.out",
              stagger: (i: number) => (wrapOff(i) + 3) * 0.075,
              onUpdate: () => (S.dirty = true),
            }),
        });

    const goTo = (p: number, duration = 0.9) => {
      tween?.kill();
      if (still) {
        S.pos = p;
        return;
      }
      tween = gsap.to(S, { pos: p, duration, ease: "expo.out" });
    };
    api.current = {
      go: (delta) => goTo(Math.round(S.pos) + delta),
      goCard: (i) => goTo(Math.round(S.pos + wrapOff(i - S.pos))),
    };

    // ---- drag / swipe (endless, so no rubber band)
    const spacing = () => {
      const { step, pivot } = S.narrow ? FAN.narrow : FAN.wide;
      return Math.sin((step * Math.PI) / 180) * S.w * pivot;
    };
    let startX = 0;
    let startPos = 0;
    let lastX = 0;
    let lastT = 0;
    let v = 0;
    let dragging = false;
    let moved = false;
    const down = (e: PointerEvent) => {
      if (e.button !== 0) return;
      dragging = true;
      moved = false;
      startX = lastX = e.clientX;
      lastT = performance.now();
      startPos = S.pos;
      v = 0;
      tween?.kill();
    };
    const move = (e: PointerEvent) => {
      if (isFine && !dragging) {
        const r = stage.getBoundingClientRect();
        S.tYaw = ((e.clientX - r.left) / r.width - 0.5) * 10;
      }
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 6 && !moved) {
        moved = true;
        stage.setPointerCapture(e.pointerId);
        stage.classList.add("is-dragging");
      }
      const now = performance.now();
      v = (e.clientX - lastX) / Math.max(now - lastT, 1);
      lastX = e.clientX;
      lastT = now;
      S.pos = startPos - dx / spacing();
    };
    const up = () => {
      if (!dragging) return;
      dragging = false;
      stage.classList.remove("is-dragging");
      if (!moved) return;
      goTo(Math.round(S.pos + gsap.utils.clamp(-2, 2, (-v * 260) / spacing())));
    };
    const leave = () => (S.tYaw = 0);
    // Swallow the click that ends a drag.
    const click = (e: MouseEvent) => {
      if (moved) {
        e.stopPropagation();
        e.preventDefault();
        moved = false;
      }
    };
    let wheelTimer = 0;
    const wheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      tween?.kill();
      S.pos += e.deltaX / spacing();
      clearTimeout(wheelTimer);
      wheelTimer = window.setTimeout(() => goTo(Math.round(S.pos)), 120);
    };

    stage.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    stage.addEventListener("pointerleave", leave);
    stage.addEventListener("click", click, true);
    stage.addEventListener("wheel", wheel, { passive: false });

    return () => {
      intro?.kill();
      tween?.kill();
      gsap.killTweensOf(deal);
      clearTimeout(wheelTimer);
      io.disconnect();
      ro.disconnect();
      gsap.ticker.remove(tick);
      stage.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      stage.removeEventListener("pointerleave", leave);
      stage.removeEventListener("click", click, true);
      stage.removeEventListener("wheel", wheel);
      api.current = null;
    };
  }, []);

  const toggleFlip = useCallback(() => setFlipped((f) => (f === active ? -1 : active)), [active]);
  const onCard = (i: number) => (i === active ? toggleFlip() : api.current?.goCard(i));

  // Pointer-tracked tilt + glare on the top card's cover
  const onCoverMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
    el.style.setProperty("--rx", `${(0.5 - y) * 10}deg`);
    el.style.setProperty("--ry", `${(x - 0.5) * 14}deg`);
    el.classList.add("is-hover");
  };
  const onCoverLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    el.classList.remove("is-hover");
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      api.current?.go(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      api.current?.go(-1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleFlip();
    }
  };

  return (
    <section className="section certs" id="certifications">
      <div className="wrap">
        <SectionHead index="06" label="Certifications" />
        <div className="cert-head">
          <h2 className="sec-title" data-reveal="lines">
            Proof <StarDock before="of" /> <span className="serif accent-text">practice</span>
          </h2>
          <div className="cert-controls">
            <span className="mono cert-count">
              <span className="cert-count-now">{String(active + 1).padStart(2, "0")}</span> / {String(N).padStart(2, "0")}
            </span>
            <button className="cert-btn" onClick={() => api.current?.go(-1)} aria-label="Previous certificate">
              <MdArrowBack />
            </button>
            <button className="cert-btn" onClick={() => api.current?.go(1)} aria-label="Next certificate">
              <MdArrowForward />
            </button>
          </div>
        </div>
      </div>

      <div
        className="cert-stage"
        ref={stageRef}
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label="Certifications. Drag, swipe or use the arrow keys. Enter flips the top card."
        onKeyDown={onKey}
      >
        <ul className="cert-track" ref={trackRef}>
          {CERTS.map((c, i) => (
            <li
              key={c.title}
              ref={(el) => (cardsRef.current[i] = el)}
              className={`cert-card ${i === active ? "is-active" : ""} ${i === flipped ? "is-flipped" : ""}`}
              onClick={() => onCard(i)}
              aria-hidden={i !== active}
            >
              <div className="cert-flip">
                <div className="cert-face cert-front">
                  <div
                    className="cert-cover"
                    onPointerMove={i === active ? onCoverMove : undefined}
                    onPointerLeave={onCoverLeave}
                  >
                    <div className="cert-cover-in">
                      <img className="cert-cover-img" src={c.image} alt={`${c.title} certificate`} loading="lazy" draggable={false} />
                      <span className="cert-cover-glare" aria-hidden="true" />
                      <div className="cert-cover-top mono">
                        <span className="cert-chip">No. {String(i + 1).padStart(2, "0")}</span>
                        {c.badge && <span className="cert-chip cert-badge">{c.badge}</span>}
                      </div>
                      {c.Icon && (
                        <span className="cert-chip cert-issuer" aria-hidden="true">
                          <c.Icon />
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="cert-body">
                    <div className="cert-meta mono">
                      <span>{c.issuer}</span>
                      <span>{c.year}</span>
                    </div>
                    <h3 className="cert-title" aria-label={c.title}>
                      <span className="cert-word">
                        <span>{c.lead}</span>
                      </span>{" "}
                      <span className="cert-word serif">
                        <span>{c.accent}</span>
                      </span>
                    </h3>
                    <span className="mono cert-turn" aria-hidden="true">
                      Flip ↻
                    </span>
                  </div>
                </div>

                <div className="cert-face cert-back" aria-hidden={i !== flipped}>
                  <div className="cert-back-top mono">
                    <span>No. {String(i + 1).padStart(2, "0")}</span>
                    <span className={c.badge ? "cert-back-badge" : ""}>{c.badge ?? c.code}</span>
                  </div>
                  <Seal id={i} year={c.year} />
                  <h3 className="cert-back-title">
                    {c.lead} <span className="serif">{c.accent}</span>
                  </h3>
                  <p className="cert-back-desc">{c.description}</p>
                  <div className="cert-back-foot mono">
                    <span>{c.issuer}</span>
                    <span>{c.year}</span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="cert-floor" aria-hidden="true" />
      </div>

      <p className="mono cert-hint wrap" aria-hidden="true">
        <span className="for-fine">Drag the deck · click the top card to flip it</span>
        <span className="for-touch">Swipe · tap the top card to flip</span>
      </p>
    </section>
  );
};

export default Certifications;
