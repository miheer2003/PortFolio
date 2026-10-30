import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MdArrowBack, MdArrowForward } from "react-icons/md";
import { FaAws } from "react-icons/fa6";
import { SiInfosys, SiUdemy } from "react-icons/si";
import type { IconType } from "react-icons";
import "./styles/Certifications.css";
import SectionHead from "./SectionHead";
import { prefersReducedMotion } from "./utils/lenis";

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
    image: img("pg-dac.png"),
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
    image: img("aws-cloud-foundations.png"),
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
const clamp = gsap.utils.clamp(0, N - 1);

const Certifications = () => {
  const stageRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLLIElement | null)[]>([]);
  const state = useRef({ pos: 0 });
  const tween = useRef<gsap.core.Tween | null>(null);
  const [active, setActive] = useState(0);

  /** Lay every card out in 3D from the fractional position. */
  const render = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const pos = state.current.pos;
    const w = cardsRef.current[0]?.offsetWidth ?? 300;
    const narrow = stage.clientWidth < 700;
    const spacing = w * (narrow ? 0.42 : 0.56);

    cardsRef.current.forEach((card, i) => {
      if (!card) return;
      const o = i - pos;
      const a = Math.abs(o);
      const s = Math.sign(o);
      // first neighbour sits close, further ones compress
      const x = s * (Math.min(a, 1) * spacing * 1.25 + Math.max(a - 1, 0) * spacing * 0.7);
      const rotY = -s * Math.min(a, 1) * 48 - s * Math.max(a - 1, 0) * 6;
      const z = -Math.min(a, 1) * 180 - Math.max(a - 1, 0) * 110;
      card.style.transform = `translate(-50%, -50%) translate3d(${x}px, 0, ${z}px) rotateY(${rotY}deg)`;
      card.style.zIndex = String(100 - Math.round(a * 10));
      card.style.opacity = String(a > 3.4 ? 0 : 1 - Math.max(a - 2.4, 0));
      card.style.setProperty("--shade", String(Math.min(a, 2) * 0.22));
      card.style.setProperty("--o", o.toFixed(3));
      card.style.pointerEvents = a > 3.4 ? "none" : "auto";
    });

    const idx = Math.round(clamp(pos));
    setActive((prev) => (prev === idx ? prev : idx));
  }, []);

  const goTo = useCallback(
    (index: number, duration = 0.9) => {
      tween.current?.kill();
      tween.current = gsap.to(state.current, {
        pos: clamp(index),
        duration: prefersReducedMotion() ? 0 : duration,
        ease: "expo.out",
        onUpdate: render,
      });
    },
    [render]
  );

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    render();

    // Fan the cards in when the section first scrolls into view.
    let intro: ScrollTrigger | null = null;
    if (!prefersReducedMotion()) {
      state.current.pos = 3;
      render();
      intro = ScrollTrigger.create({
        trigger: stage,
        start: "top 80%",
        once: true,
        onEnter: () => goTo(0, 2.2),
      });
    } else {
      state.current.pos = 0;
      render();
    }

    // Drag / swipe
    let startX = 0;
    let startPos = 0;
    let lastX = 0;
    let lastT = 0;
    let vel = 0;
    let dragging = false;
    let moved = false;

    const spacing = () => (cardsRef.current[0]?.offsetWidth ?? 300) * (stage.clientWidth < 700 ? 0.5 : 0.62);

    const down = (e: PointerEvent) => {
      if (e.button !== 0) return;
      dragging = true;
      moved = false;
      startX = lastX = e.clientX;
      lastT = performance.now();
      startPos = state.current.pos;
      vel = 0;
      tween.current?.kill();
      stage.classList.add("is-dragging");
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 6 && !moved) {
        moved = true;
        stage.setPointerCapture(e.pointerId);
      }
      const now = performance.now();
      vel = (e.clientX - lastX) / Math.max(now - lastT, 1);
      lastX = e.clientX;
      lastT = now;
      // rubber-band past the ends
      let p = startPos - dx / spacing();
      if (p < 0) p *= 0.35;
      if (p > N - 1) p = N - 1 + (p - (N - 1)) * 0.35;
      state.current.pos = p;
      render();
    };
    const up = () => {
      if (!dragging) return;
      dragging = false;
      stage.classList.remove("is-dragging");
      if (!moved) return;
      const fling = (-vel * 260) / spacing();
      goTo(Math.round(state.current.pos + gsap.utils.clamp(-2, 2, fling)));
    };
    // Block the click that follows a drag so cards don't jump.
    const click = (e: MouseEvent) => {
      if (moved) {
        e.stopPropagation();
        e.preventDefault();
        moved = false;
      }
    };
    // Trackpad horizontal swipe
    let wheelTimer = 0;
    const wheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      tween.current?.kill();
      state.current.pos = gsap.utils.clamp(-0.3, N - 0.7, state.current.pos + e.deltaX / spacing());
      render();
      clearTimeout(wheelTimer);
      wheelTimer = window.setTimeout(() => goTo(Math.round(state.current.pos)), 120);
    };

    const onResize = () => render();

    stage.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    stage.addEventListener("click", click, true);
    stage.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("resize", onResize);

    return () => {
      intro?.kill();
      tween.current?.kill();
      clearTimeout(wheelTimer);
      stage.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      stage.removeEventListener("click", click, true);
      stage.removeEventListener("wheel", wheel);
      window.removeEventListener("resize", onResize);
    };
  }, [render, goTo]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(active + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(active - 1);
    }
  };

  return (
    <section className="section certs" id="certifications">
      <div className="wrap">
        <SectionHead index="06" label="Certifications" />
        <div className="cert-head">
          <h2 className="sec-title" data-reveal="lines">
            Proof of <span className="serif accent-text">practice</span>
          </h2>
          <div className="cert-controls">
            <span className="mono cert-count">
              <span className="cert-count-now">{String(active + 1).padStart(2, "0")}</span> / {String(N).padStart(2, "0")}
            </span>
            <button className="cert-btn" onClick={() => goTo(active - 1)} disabled={active === 0} aria-label="Previous certificate">
              <MdArrowBack />
            </button>
            <button className="cert-btn" onClick={() => goTo(active + 1)} disabled={active === N - 1} aria-label="Next certificate">
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
        aria-label="Certifications. Drag, swipe or use arrow keys."
        onKeyDown={onKey}
      >
        <ul className="cert-track">
          {CERTS.map((c, i) => (
            <li
              key={c.title}
              ref={(el) => (cardsRef.current[i] = el)}
              className={`cert-card ${i === active ? "is-active" : ""}`}
              onClick={() => i !== active && goTo(i)}
              aria-hidden={i !== active}
            >
              <div className="cert-cover">
                <img className="cert-cover-img" src={c.image} alt="" loading="lazy" draggable={false} />
                <span className="cert-cover-grid" aria-hidden="true" />
                <span className="cert-cover-sheen" aria-hidden="true" />
                <div className="cert-cover-top mono">
                  <span>No. {String(i + 1).padStart(2, "0")}</span>
                  {c.badge ? <span className="cert-badge">{c.badge}</span> : <span>{c.year}</span>}
                </div>
                <span className="cert-seal" aria-hidden="true">
                  {c.Icon ? <c.Icon /> : <span className="cert-seal-text">ACTS</span>}
                </span>
                <span className="cert-code">{c.code}</span>
              </div>
              <div className="cert-body">
                <div className="cert-meta mono">
                  <span>{c.issuer}</span>
                  <span>{c.year}</span>
                </div>
                <h3 className="cert-title" aria-label={c.title}>
                  <span>{c.lead}</span> <span className="serif accent-text">{c.accent}</span>
                </h3>
                <p className="cert-desc">{c.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="mono cert-hint wrap" aria-hidden="true">
        ← Drag or swipe →
      </p>
    </section>
  );
};

export default Certifications;
